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

  componentDidMount() {
    chrome.storage.sync.get("stream_id", ({ stream_id }) => {
      if (stream_id) {
        this.setState({ streamId: stream_id, isLoading: false });
      } else {
        SubReaderAPI.getAuthToken(["premium"]).then(({ token, id }) => {
          this.setState({
            isLoading: false,
            authId: id
          });
          SubReaderAPI.getServiceToken(token).then(
            ({ service_token, expires_in }) => {
              chrome.storage.sync.set({
                service_token,
                service_token_expiration: Date.now() + expires_in * 1000
              });
            }
          );
        });
      }

      chrome.storage.onChanged.addListener(changes => {
        const { stream_id } = changes;
        if (stream_id) {
          this.setState({ streamId: stream_id.newValue, isLoading: false });
        }
      });
    });
  }

  render() {
    const { isLoading, streamId, authId } = this.state;
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
        {isLoading ? (
          <div>Loading</div>
        ) : streamId ? (
          <div>
            <QRCode value={`subreader://${streamId}`} />
          </div>
        ) : (
          <div>
            <QRCode value={`subreader://authenticate?id=${authId}`} />
          </div>
        )}
      </div>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById("app"));
