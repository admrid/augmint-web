/* TODO: maintain loan state instead of full refresh on loan repay, newloan, loancollected events */

import store from "modules/store";
import { setupWatch } from "./web3Provider";
import {
    connectLoanManager,
    refreshLoanManager,
    fetchProducts,
    fetchLoansToCollect
} from "modules/reducers/loanManager";
import { fetchLoansForAddress } from "modules/reducers/loans";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { fetchUserBalance } from "modules/reducers/userBalances";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";

export default () => {
    const loanManager = store.getState().loanManager;
    const web3Connect = store.getState().web3Connect;

    if (!loanManager.isLoading && !loanManager.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("augmintToken.contract", onAugmintTokenContractChange);
        setupWatch("loanManager.contract", onLoanManagerContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
        if (web3Connect.isConnected) {
            console.debug(
                "loanManagerProvider - loanManager not connected or loading and web3 already loaded, dispatching connectLoanManager() "
            );
            store.dispatch(connectLoanManager());
        }
    }
    return;
};

const setupListeners = () => {
    const loanManager = store.getState().loanManager.contract.ethersInstance;
    loanManager.onnewloan = onNewLoan;
    loanManager.onloanrepayed = onLoanRepayed;
    loanManager.onloancollected = onLoanCollected;
    // TODO: add & handle loanproduct change events
};

const removeListeners = () => {
    // TODO: test if we need this with ethers
    // const loanManagerContract = store.getState().loanManager.contract;
    // if (loanManagerContract !== null) {
    //     console.debug("loanManagerProvider - web3Connect.network changed. removing old listeners");
    //     const loanManager = loanManagerContract.instance;
    //     // loanManager.NewLoan().stopWatching();
    //     // loanManager.LoanRepayed().stopWatching();
    //     // loanManager.LoanCollected().stopWatching();
    // }
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    removeListeners();
    if (newVal !== null) {
        console.debug("loanManagerProvider - web3Connect.network changed. Dispatching connectLoanManager()");
        store.dispatch(connectLoanManager());
    }
};

const onAugmintTokenContractChange = (newVal, oldVal, objectPath) => {
    refreshLoanManagerIfNeeded(newVal, oldVal);
};

const onLoanManagerContractChange = (newVal, oldVal, objectPath) => {
    refreshLoanManagerIfNeeded(newVal, oldVal);
};

const refreshLoanManagerIfNeeded = (newVal, oldVal) => {
    removeListeners();
    if (newVal && store.getState().augmintToken.isConnected) {
        console.debug(
            "loanManagerProvider - new augmintToken or loanManager contract. Dispatching refreshLoanManager, fetchProducts, fetchLoans"
        );
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(refreshLoanManager());
        store.dispatch(fetchProducts());
        store.dispatch(fetchLoansForAddress(userAccount));
        setupListeners();
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const loanManager = store.getState().loanManager;
    if (loanManager.isConnected && newVal !== "?") {
        console.debug("loanManagerProvider - web3Connect.userAccount changed. Dispatching fetchLoans()");
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(fetchLoansForAddress(userAccount));
    }
};

const onNewLoan = (productId, loanId, borrower, collateralAmount, loanAmount, repaymentAmount) => {
    // event NewLoan(uint8 productId, uint loanId, address borrower, uint collateralAmount, uint loanAmount, uint repaymentAmount);
    console.debug(
        "loanManagerProvider.onNewLoan: dispatching refreshLoanManager, refreshAugmintToken, fetchProducts & refreshMonetarySupervisor"
    );
    store.dispatch(refreshAugmintToken());
    store.dispatch(refreshMonetarySupervisor());
    store.dispatch(refreshLoanManager()); // to update loanCount
    store.dispatch(fetchProducts()); // to update maxLoanAmounts
    const userAccount = store.getState().web3Connect.userAccount;
    if (borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onNewLoan: new loan for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

const onLoanRepayed = (loanId, borrower) => {
    // event LoanRepayed(uint loanId, address borrower);
    console.debug(
        "loanManagerProvider.onRepayed:: Dispatching refreshAugmintToken, fetchProducts & refreshMonetarySupervisor"
    );
    store.dispatch(refreshAugmintToken());
    store.dispatch(refreshMonetarySupervisor());
    store.dispatch(fetchProducts()); // to update maxLoanAmounts
    const userAccount = store.getState().web3Connect.userAccount;
    if (borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onRepayed: loan repayed for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

const onLoanCollected = (loanId, borrower) => {
    // event LoanCollected(uint loanId, address borrower);
    console.debug(
        "loanManagerProvider.onCollected: Dispatching refreshAugmintToken, fetchProducts & refreshMonetarySupervisor"
    );
    store.dispatch(refreshAugmintToken());
    store.dispatch(refreshMonetarySupervisor());
    store.dispatch(fetchProducts()); // to update maxLoanAmounts
    const userAccount = store.getState().web3Connect.userAccount;
    if (borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onCollected: loan collected for current user. Dispatching fetchLoans & fetchUserBalance"
        );

        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }

    const loansToCollect = store.getState().loanManager.loansToCollect;
    if (loansToCollect && loansToCollect.length > 0) {
        console.debug(
            "loanManagerProvider.onCollected: loan collected and we already had loans to collect fetched . Dispatching fetchLoansToCollect"
        );

        store.dispatch(fetchLoansToCollect());
    }
};
