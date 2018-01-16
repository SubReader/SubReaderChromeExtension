import React, { Component } from "react";
import ReactDOM from "react-dom";
import QRCode from "qrcode.react";
import * as SubReaderAPI from "subreader-api";

export default class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      serviceToken: null,
      authId: null,
      streamId: ""
    };
  }

  componentDidMount() {
    chrome.storage.sync.get(
      "service_token",
      ({ service_token: serviceToken }) => {
        if (serviceToken) {
          this.setState({ serviceToken, isLoading: false });
        } else {
          SubReaderAPI.getAuthToken().then(
            ({ token: authToken, id: authId }) => {
              this.setState({ authId, isLoading: false });
              SubReaderAPI.getServiceToken(authToken).then(serviceToken => {
                chrome.storage.sync.set({ service_token: serviceToken }, () => {
                  this.setState({ serviceToken });
                });
              });
            }
          );
        }
      }
    );

    chrome.storage.sync.get("streamId", ({ streamId }) => {
      this.setState({ streamId });
    });
  }

  render() {
    if (this.state.isLoading) {
      return <div>Loading</div>;
    }
    if (this.state.serviceToken) {
      return (
        <div>
          <QRCode value={`subreader://${this.state.streamId}`} />
        </div>
      );
    }
    return (
      <div>
        <QRCode value={`subreader://authenticate?id=${this.state.authId}`} />
      </div>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById("app"));
