const RandomSeed = require("random-seed");
const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const exchangeTestHelper = require("./helpers/exchangeTestHelper.js");
const ratesTestHelper = new require("./helpers/ratesTestHelper.js");

const ONEWEI = 1000000000000000000;
const ETH_ROUND = 1000000000000; // 6 decimals places max in ETH

const ETH_SELL = 0;
const ETH_BUY = 1;

const ORDER_COUNT = 10;
const MARKET_WEI_RATE = 5000000; // 1ETH = 500 EUR
const MIN_ORDER_RATE = 9000;
const MAX_ORDER_RATE = 11000;
const MIN_TOKEN = 1000000; // 100 ACE
const MAX_TOKEN = 10000000; // 1,000 ACE
const TEST_ACCS_CT = web3.eth.accounts.length;
const ACC_INIT_ACE = 100000000;

let rates, tokenAce, exchange, peggedSymbol;
const random = new RandomSeed("Have the same test data");
let sellOrders = [];
let matches = [];
let matchArgs = [];
let stateAfterAllMatch = {};

const getOrderToFill = async () => {
    // this could be optimized ...
    const state = await exchangeTestHelper.getState();
    if (sellOrders.length !== state.sellCount) {
        // retreive sell orders
        sellOrders = [];
        for (let i = 0; i < state.sellCount; i++) {
            sellOrders.push(await exchangeTestHelper.getSellOrder(i));
        }
    }
    let match;
    for (let i = 0; i < state.buyCount && !match; i++) {
        const buyOrder = await exchangeTestHelper.getBuyOrder(i);
        for (let j = 0; j < sellOrders.length && !match; j++) {
            const sellOrder = sellOrders[j];

            if (buyOrder.price.gte(sellOrder.price)) {
                match = { sellOrder: sellOrder, buyOrder: buyOrder };
            }
        }
    }
    return match;
};

/*
 NB: These tests dependend on each other i.e. place orders then match one by one has to run first
*/
contract("Exchange load tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock("EUR", MARKET_WEI_RATE);
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        peggedSymbol = web3.toAscii(await tokenAce.peggedSymbol());
        await tokenAce.issue(TEST_ACCS_CT * ACC_INIT_ACE);
        for (let i = 0; i < TEST_ACCS_CT; i++) {
            await tokenAce.withdrawTokens(accounts[i], ACC_INIT_ACE);
        }

        exchange = await exchangeTestHelper.newExchangeMock(tokenAce, rates, MIN_TOKEN);
    });

    it("place x buy / sell orders", async function() {
        for (let i = 0; i < ORDER_COUNT; i++) {
            const tokenAmount = Math.round(random.random() * 10000 * (MAX_TOKEN - MIN_TOKEN) / 10000) + MIN_TOKEN;
            const price = Math.floor(random.random() * (MAX_ORDER_RATE - MIN_ORDER_RATE)) + MIN_ORDER_RATE;
            const weiAmount =
                Math.round(tokenAmount * price / 10000 / MARKET_WEI_RATE * ONEWEI / ETH_ROUND) * ETH_ROUND;
            const orderType = random.random() < 0.5 ? ETH_SELL : ETH_BUY;
            const order = {
                amount: orderType === ETH_SELL ? weiAmount : tokenAmount,
                maker: accounts[Math.floor(random.random() * (TEST_ACCS_CT - 1))],
                price: price,
                tokenAmount: tokenAmount,
                weiAmount: weiAmount,
                orderType: orderType
            };
            if (order.orderType === ETH_SELL) {
                const tx = await exchange.placeSellEthOrder(order.price, { value: order.amount, from: order.maker });
                testHelper.logGasUse(this, tx, "SELL order");
            } else {
                const tx = await tokenAce.placeBuyEthOrderOnExchange(exchange.address, order.price, order.amount, {
                    from: order.maker
                });
                testHelper.logGasUse(this, tx, "BUY order");
            }
        }
        //await exchangeTestHelper.printOrderBook(10);
    });

    it("should fill x matching orders", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);
        let match = await getOrderToFill();
        while (match) {
            console.log(
                "MATCH:  Sell price: " + match.sellOrder.price.div(10000).toString(),
                "  Buy price: " + match.buyOrder.price.div(10000).toString(),
                "  Sell amount: " + web3.fromWei(match.sellOrder.amount) + " ETH",
                "  Buy amount: " + match.buyOrder.amount.div(10000).toString() + " ACE",
                "  Sell Id: " + match.sellOrder.id,
                "  Buy id: " + match.buyOrder.id
            );
            //await exchangeTestHelper.printOrderBook(10);
            const tx = await exchange.matchOrders(
                match.sellOrder.index,
                match.sellOrder.id,
                match.buyOrder.index,
                match.buyOrder.id
            );
            // save match for later use by other test cases (calculating matches is time consuming)
            matches.push(match);
            testHelper.logGasUse(this, tx, "matchOrders");
            match = await getOrderToFill();
        }

        // convert & transpose matches to the format required by matchMultipleOrders
        matchArgs = matches.reduce(
            (args, match) => (
                args.sellIndexes.push(match.sellOrder.index),
                args.sellIds.push(match.sellOrder.id),
                args.buyIndexes.push(match.buyOrder.index),
                args.buyIds.push(match.buyOrder.id),
                args
            ),
            {
                sellIndexes: [],
                sellIds: [],
                buyIndexes: [],
                buyIds: []
            }
        );
        // save state to compare it with matchMultipleOrders' results
        stateAfterAllMatch = await exchangeTestHelper.getState();

        //await exchangeTestHelper.printOrderBook(10);

        await testHelper.revertSnapshot(snapshotId);
    });

    /* FIXME: matchMultipleOrders() is not finished */
    it.skip("should x orders at once (matchMultipleOrders)", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);
        // console.log(stateAfterAllMatch, matchArgs.sellIndexes.length);
        // console.log(matches);
        // console.log(matchArgs);
        const tx = await exchange.matchMultipleOrders(
            matchArgs.sellIndexes,
            matchArgs.sellIds,
            matchArgs.buyIndexes,
            matchArgs.buyIds
        );
        testHelper.logGasUse(this, tx, "matchMultipleOrders");

        //await exchangeTestHelper.printOrderBook(10);

        const stateAfter = await exchangeTestHelper.getState();
        assert.equal(stateAfter.sellCount, stateAfterAllMatch.sellCount, "sellCount should == after 1by1 matching all");
        assert.equal(stateAfter.buyCount, stateAfterAllMatch.buyCount, "buyCount should == after 1by1 matching all");

        await testHelper.revertSnapshot(snapshotId);
    });

    it("should cancel all orders", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);
        const stateBefore = await exchangeTestHelper.getState();

        // delete in a random order
        for (let i = stateBefore.sellCount - 1; i >= 0; i--) {
            const delIdx = Math.floor(random.random() * i);
            const order = await exchangeTestHelper.getSellOrder(delIdx);
            const tx = await exchange.cancelSellEthOrder(order.index, order.id, { from: order.maker });
            testHelper.logGasUse(this, tx, "cancelSellEthOrder");
        }

        for (let i = stateBefore.buyCount - 1; i >= 0; i--) {
            const delIdx = Math.floor(random.random() * i);
            const order = await exchangeTestHelper.getBuyOrder(delIdx);
            const tx = await exchange.cancelBuyEthOrder(order.index, order.id, { from: order.maker });
            testHelper.logGasUse(this, tx, "cancelBuyEthOrder");
        }

        const stateAfter = await exchangeTestHelper.getState();

        //await exchangeTestHelper.printOrderBook(10);
        assert.equal(stateAfter.sellCount, 0);
        assert.equal(stateAfter.buyCount, 0);

        await testHelper.revertSnapshot(snapshotId);
    });
});
