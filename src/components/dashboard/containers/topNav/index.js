import React from "react";
import { connect } from "react-redux";

import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";

import Icon from "components/augmint-ui/icon";

import { StyledTopNav, StyledTopNavUl, StyledTopNavLi, StyledTopNavLinkRight, StyledPrice } from "./styles";

class TopNav extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
        ratesProvider();
    }
    render() {
        const { address } = this.props.userAccount;
        return (
            <StyledTopNav>
                <StyledTopNavUl>
                    <StyledTopNavLi>
                        <StyledPrice>
                            <span className="price">€/ETH {this.props.rates.info.ethFiatRate}</span>
                        </StyledPrice>
                    </StyledTopNavLi>
                    <StyledTopNavLi>
                        <StyledTopNavLinkRight title="Your account" to="account">
                            <Icon name="account" />
                            <span>{address.substring(0, 8)}</span>
                        </StyledTopNavLinkRight>
                    </StyledTopNavLi>
                    <StyledTopNavLi>
                        <StyledTopNavLinkRight title="Under the hood" to="under-the-hood">
                            <Icon name="connect" />
                            <span>{this.props.web3Connect.network.name}</span>
                        </StyledTopNavLinkRight>
                    </StyledTopNavLi>
                </StyledTopNavUl>
            </StyledTopNav>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    rates: state.rates
});

export default connect(mapStateToProps)(TopNav);