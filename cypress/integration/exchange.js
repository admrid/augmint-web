describe("Augmint exchange", function() {
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
        cy.getGasPriceInEth().as("gasPriceInEth");
    });

    it("Should place and cancel buy order on exchange and also check the trade history", function() {
        const tokenAmount = 102.01;
        const ethAmount = 0.10324;
        const price = 101;

        let tradeHistoryStartLength;

        cy.get("[data-testid=exchangeMenuLink]").click();

        cy.get("[data-testid=trade-history] tbody").as("tradeHistoryTbody");
        cy
            .get("@tradeHistoryTbody")
            .then(() => {
                cy
                    .get("@tradeHistoryTbody")
                    .invoke("attr", "data-test-historycount")
                    .as("tradeHistoryStartLength");
            })
            .then(() => {
                tradeHistoryStartLength = parseInt(this.tradeHistoryStartLength);
            });

        cy
            .get("[data-testid=priceInput]")
            .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
            .type("{selectall}" + price)
            .should("have.value", price.toString());

        cy
            .get("[data-testid=tokenAmountInput]")
            .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
            .type("{selectall}" + tokenAmount)
            .should("have.value", tokenAmount.toString());

        cy.get("[data-testid=ethAmountInput]").should("have.value", ethAmount.toString());

        cy
            .get("@tradeHistoryTbody")
            .then(() => {
                cy
                    .get("@tradeHistoryTbody")
                    .invoke("attr", "data-test-historycount")
                    .as("tradeHistoryCurrentLength");
            })
            .then(() => {
                expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength);
            });

        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order submitted");

        cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .should("contain", "confirmation")
            .as("successPanel");

        cy
            .get("@successPanel")
            .contains("confirmation")
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-orderid")
                    .as("orderId");

                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("orderGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();
                cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) - ethAmount - parseInt(this.orderGasUsed) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "NewOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 1);
                    });

                // TODO: check orderlist
                // TODO: check tradelist

                // Cancel order
                cy.get(`[data-testid=myOrdersBlock] [data-testid=cancelOrderButton-${this.orderId}]`).click();
                cy.get(`[data-testid=confirmCancelOrderButton-${this.orderId}`).click();
                cy.get("@successPanel").contains("confirmation");
            })
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("cancelGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) -
                    (parseInt(this.cancelGasUsed) + parseInt(this.orderGasUsed)) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "CancelledOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 2);
                    });
            });
    });

    it("Should place and cancel sell order on exchange and also check the trade history", function() {
        const tokenAmount = 98.8;
        const ethAmount = 0.1;
        const price = 99;

        let tradeHistoryStartLength;

        cy.get("[data-testid=exchangeMenuLink]").click();
        cy.get("[data-testid=sellMenuLink]").click();

        cy.get("[data-testid=trade-history] tbody").as("tradeHistoryTbody");
        cy
            .get("@tradeHistoryTbody")
            .then(() => {
                cy
                    .get("@tradeHistoryTbody")
                    .invoke("attr", "data-test-historycount")
                    .as("tradeHistoryStartLength");
            })
            .then(() => {
                tradeHistoryStartLength = parseInt(this.tradeHistoryStartLength);
            });

        cy
            .get("[data-testid=priceInput]")
            .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
            .type("{selectall}" + price)
            .should("have.value", price.toString());

        cy
            .get("[data-testid=ethAmountInput]")
            .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
            .type("{selectall}" + ethAmount)
            .should("have.value", ethAmount.toString());

        cy.get("[data-testid=tokenAmountInput]").should("have.value", tokenAmount.toString());

        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order submitted");

        cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .should("contain", "confirmation")
            .as("successPanel")
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-orderid")
                    .as("orderId");

                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("orderGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();
                cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) - parseInt(this.orderGasUsed) * this.gasPriceInEth;
                const expectedAEurBalance = Math.round((this.startingAeurBalance - tokenAmount) * 100) / 100; // 2397.99 - 997 = 1400.9899999999998
                cy.assertUserAEurBalanceOnUI(expectedAEurBalance);
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "NewOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 1);
                    });

                // TODO: check orderlist
                // TODO: check tradelist

                // Cancel order
                cy.get(`[data-testid=myOrdersBlock] [data-testid=cancelOrderButton-${this.orderId}]`).click();
                cy.get(`[data-testid=confirmCancelOrderButton-${this.orderId}`).click();

                cy.get("@successPanel").should("contain", "confirmation");
            })
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("cancelGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) -
                    (parseInt(this.cancelGasUsed) + parseInt(this.orderGasUsed)) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "CancelledOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 2);
                    });
            });
    });

    it("Should match a buy and sell order and also check the trade history", function() {
        const tokenAmount = 201.6;
        const ethAmount = 0.2;
        const price = 101;

        cy.get("[data-testid=exchangeMenuLink]").click();
        cy.get("[data-testid=sellMenuLink]").click();

        cy
            .get("[data-testid=priceInput]")
            .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
            .type("{selectall}" + price)
            .should("have.value", price.toString());

        cy
            .get("[data-testid=ethAmountInput]")
            .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
            .type("{selectall}" + ethAmount)
            .should("have.value", ethAmount.toString());

        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();

        cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .should("contain", "confirmation")
            .as("successPanel")
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("[data-testid=buyMenuLink]").click();

                cy
                    .get("[data-testid=priceInput]")
                    .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
                    .type("{selectall}" + price)
                    .should("have.value", price.toString());

                cy
                    .get("[data-testid=tokenAmountInput]")
                    .invoke("attr", "type", "text") // cast to text. workaround for https://github.com/cypress-io/cypress/issues/1171
                    .type("{selectall}" + tokenAmount)
                    .should("have.value", tokenAmount.toString());

                cy.get("[data-testid=submitButton]").click();

                cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order submitted");
                cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("@successPanel").should("contain", "confirmation");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("[data-testid=matchTopOrdersButton]").click();

                cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order match submitted");
                cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("@successPanel").should("contain", "confirmation");
                cy
                    .get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]")
                    .click()
                    .then(() => {
                        cy.get("[data-testid=trade-history] tbody").as("tradeHistoryTbody");
                        cy.get("@tradeHistoryTbody").then(() => {
                            cy.get("@tradeHistoryTbody").should("contain", "OrderFill");
                        });
                    });
                // TODO: check balances (it might be too complicated to make test independent, i.e. unsure what are the top orders b/c of prev tests' leftovers)
            });
    });
});
