import React, { Component } from "react"
import QRCode from "qrcode.react"


export default class ConnectView extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showQR: true
    }
  }

  toggleShow() {
    this.setState({
      showQR: !this.state.showQR
    })
  }

  render() {
    const { id } = this.props
    const { showQR } = this.state
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItens: "center" }}>
          {showQR ?
            <div onClick={() => this.toggleShow()}>
              <QRCode
                value={`subreader://${id}`}
              />
            </div>
            :
            <h2 onClick={() => this.toggleShow()}>{id}</h2>
          }
        </div>
      </div>
    )
  }
}
