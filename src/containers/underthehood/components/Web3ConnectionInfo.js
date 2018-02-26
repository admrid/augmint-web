import React from "react";
import store from "modules/store";
import { setupWeb3 } from "modules/reducers/web3Connect";
import { ErrorPanel } from "components/MsgPanels";
import stringifier from "stringifier";
import { Button } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";

const stringifyInfo = stringifier({ maxDepth: 3, indent: "   " });

export default class Web3ConnectionInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            providerInfoOpen: false
        };
    }

    render() {
        const { isLoading, isConnected, web3Instance, error, info } = this.props.web3Connect;
        const stringify = stringifier({ maxDepth: 3, indent: "   " });
        const handleRefreshClick = e => {
            e.preventDefault();
            store.dispatch(setupWeb3());
        };
        return (
            <Pblock header="Web3 connection">
                <p testid="web3ConnectionInfo">
                    {isConnected ? "connected - " + web3Instance.currentProvider.constructor.name : "not connected"} |{" "}
                    {isLoading ? "Loading..." : "not loading"}
                </p>
                <p>Info:</p>
                <pre style={{ fontSize: "0.8em", overflow: "auto" }}>{stringifyInfo(info)}</pre>

                {error ? <ErrorPanel header="Error">{error.message}</ErrorPanel> : <p>No connection error</p>}

                <Button
                    basic
                    size="small"
                    onClick={() =>
                        this.setState({
                            providerInfoOpen: !this.state.providerInfoOpen
                        })
                    }
                >
                    {this.state.providerInfoOpen ? "<< Hide provider info" : "Show provider info >>"}
                </Button>
                {this.state.providerInfoOpen && (
                    <Pblock>
                        <pre style={{ fontSize: "0.8em", overflow: "auto" }}>
                            {web3Instance ? stringify(web3Instance.currentProvider) : "No web3 Instance"}
                        </pre>
                    </Pblock>
                )}

                <Button size="small" onClick={handleRefreshClick}>
                    Reconnect web3
                </Button>
            </Pblock>
        );
    }
}
