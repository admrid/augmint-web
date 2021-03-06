import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import AccountInfo from "components/AccountInfo";
import FiatExchange from "./components/FiatExchange";
import OrderBook from "./components/OrderBook";
import MyOrders from "./components/MyOrders";
import TradeHistory from "./components/TradeHistory";
import ExchangeSummary from "./components/ExchangeSummary";
import PlaceOrderForm from "./components/PlaceOrderForm";
import { EthereumState } from "containers/app/EthereumState";
import MatchOrdersButton from "./components/MatchOrdersButton";

class ExchangeHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        exchangeProvider();
        ratesProvider();
    }
    render() {
        const { network, orders, userAccount, exchange, rates, trades } = this.props;
        return (
            <EthereumState>
                <Psegment>
                    <Pheader header="Buy & Sell A-EUR" />
                    <Pgrid>
                        <Pgrid.Row columns={2}>
                            <Pgrid.Column>
                                <AccountInfo account={userAccount} />

                                <FiatExchange
                                    header="€ &harr; A€ on partner exchange"
                                    userAccountAddress={userAccount.address}
                                    network={network}
                                />

                                <PlaceOrderForm
                                    orders={orders}
                                    exchange={exchange}
                                    rates={rates}
                                    header="A€ &harr; ETH on Augmint"
                                />

                                <MyOrders
                                    testid="myOrdersBlock"
                                    orders={orders}
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="My open orders"
                                />
                            </Pgrid.Column>

                            <Pgrid.Column>
                                <ExchangeSummary exchange={exchange} rates={rates} />
                                {orders.orders && (
                                    <MatchOrdersButton
                                        buyOrder={orders.orders.buyOrders[0]}
                                        sellOrder={orders.orders.sellOrders[0]}
                                        label="Match top sell and buy order"
                                    />
                                )}
                                <OrderBook
                                    testid="allOrdersBlock"
                                    orders={orders}
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="Order book"
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>
                        <Pgrid.Row>
                            <TradeHistory
                                trades={trades}
                                userAccountAddress={userAccount.address}
                                header="My trade history"
                            />
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    network: state.web3Connect.network,
    userAccount: state.userBalances.account,
    exchange: state.exchange,
    orders: state.orders,
    rates: state.rates,
    trades: state.trades
});

export default connect(mapStateToProps)(ExchangeHome);
