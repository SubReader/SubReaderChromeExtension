import React, { Component } from "react";
import ReactDOM from "react-dom";
import QRCode from "qrcode.react";
import * as SubReaderAPI from "subreader-api";

export default class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      authId: null,
      streamId: null
    };
  }

  getServiceToken() {
    return SubReaderAPI.getAuthToken()
      .then(({ token: authToken, id: authId }) => {
        this.setState({ authId, isLoading: false });
        return SubReaderAPI.getServiceToken(authToken);
      })
      .then(({ service_token: serviceToken, expires_in: expiresIn }) => {
        chrome.storage.sync.set({
          service_token: serviceToken,
          service_token_expiration: Date.now() + expiresIn * 1000
        });
      });
  }

  componentDidMount() {
    chrome.storage.sync.get(
      "service_token",
      ({ service_token: serviceToken }) => {
        if (serviceToken) {
          this.setState({ isLoading: false });
        } else {
          this.getServiceToken();
        }
      }
    );

    chrome.storage.sync.get("stream_id", ({ stream_id: streamId }) => {
      if (streamId) {
        this.setState({ streamId });
      }
    });

    chrome.storage.onChanged.addListener(changes => {
      const { stream_id: streamId } = changes;
      if (streamId) {
        this.setState({ streamId: streamId.newValue });
      }
    });
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }}
      >
        <img src="logo.png" style={{ width: "164px", marginBottom: "10px" }} />
        {(() => {
          if (this.state.isLoading) {
            return <div>Loading</div>;
          }
          if (this.state.streamId) {
            return (
              <div>
                <QRCode value={`subreader://${this.state.streamId}`} />
              </div>
            );
          }
          return (
            <div>
              <QRCode
                value={`subreader://authenticate?id=${this.state.authId}`}
              />
            </div>
          );
        })()}
      </div>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById("app"));
