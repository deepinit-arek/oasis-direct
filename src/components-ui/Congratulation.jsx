// Libraries
import React from "react"

// UI Components
import Spinner from "../components-ui/Spinner";
import TokenAmount from "../components-ui/TokenAmount";

// Utils
import {calculateTradePrice, fetchETHPriceInUSD, toWei} from "../utils/helpers";

class Congratulation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      priceInUSD: 0
    }
  }

  //TODO: Remove this from here. We have this from the TradeWidget and stored in the system store.
  fetchPriceInUSD = () => {
    fetchETHPriceInUSD().then(price => {
      this.setState({priceInUSD: price});
    })
  }

  componentDidMount() {
    this.priceTickerInterval = (this.fetchPriceInUSD(), setInterval(this.fetchPriceInUSD, 3000000));
  }

  componentWillUnmount() {
    clearInterval(this.priceTickerInterval);
  }

  render = () => {
    const finalizedPrice = this.props.quotation.isCounter
                            ? calculateTradePrice(this.props.quotation.base, this.props.sold, this.props.quotation.quote, this.props.bought)
                            : calculateTradePrice(this.props.quotation.base, this.props.bought, this.props.quotation.quote, this.props.sold);
    return (
      <div data-test-id="summary" className="transaction-result congratulation">
        <h3 className="heading">
          <span>Congratulations!</span>
          <span className="status label info">Confirmed</span>
        </h3>
        <div className="content">
          {
            this.props.hasCreatedProxy &&
            <span data-test-id="proxy-creation-summary" className="label">
              You have successfully created a<span className="value"> Proxy </span>
              <br/>
              <br/>
            </span>
          }
          <span data-test-id="congratulation-message" className="label">
            {
              this.props.hasCreatedProxy
              ?
                <React.Fragment>You have {this.props.quotation.isCounter ? "sold" : "bought"} </React.Fragment>
              :
                <React.Fragment>By using your <span className="value"> Proxy </span> you {this.props.quotation.isCounter ? "sold" : "bought"}</React.Fragment>
            }
            <span data-test-id={this.props.quotation.isCounter ? "sold-token" : "bought-token"}>
              <TokenAmount number={this.props.quotation.isCounter ? this.props.sold : this.props.bought}
                           decimal={5}
                           token={this.props.quotation.base.toUpperCase()}/>&nbsp;
            </span>

            {this.props.quotation.isCounter ? "for" : "with"}
            <span data-test-id={this.props.quotation.isCounter ? "bought-token" : "sold-token"}>
              <TokenAmount number={this.props.quotation.isCounter ? this.props.bought : this.props.sold} decimal={5}
                           token={this.props.quotation.quote.toUpperCase()}/>&nbsp;
            </span>
            <br/>
            at
            <span data-test-id="final-price">
              <TokenAmount number={toWei(finalizedPrice.price)}
                           token={`${finalizedPrice.priceUnit.toUpperCase()}`} />&nbsp;
            </span>
            by paying
            <span className="value">
              {
                this.props.isCalculatingGas
                ?
                  <span><Spinner /></span>
                :
                  <TokenAmount number={this.props.gas * this.state.priceInUSD} token={"USD"} />
              }&nbsp;
            </span>
            gas cost
          </span>
        </div>
      </div>
    )
  }
}

export default Congratulation;
