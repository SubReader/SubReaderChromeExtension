import React, { Component } from "react";
import ReactDOM from "react-dom";
import QRCode from "qrcode.react";
import * as SubReaderAPI from "subreader-api";
import { resolve } from "path";

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
    this.setState({ isLoading: true });
    SubReaderAPI.getAuthToken(["premium"]).then(({ token, id }) => {
      this.setState({
        isLoading: false,
        authId: id
      });
      SubReaderAPI.getServiceToken(token).then(
        ({ service_token, expires_in }) => {
          chrome.storage.local.set({
            service_token,
            service_token_expiration: Date.now() + expires_in * 1000
          });
        }
      );
    });
  }

  getStreamId() {
    chrome.storage.local.get("stream_id", ({ stream_id }) => {
      if (stream_id) {
        this.setState({ streamId: stream_id, isLoading: false });
      } else {
        this.getServiceToken();
      }
    });
  }

  setupStreamIdChangeHandler() {
    chrome.storage.onChanged.addListener(changes => {
      const { stream_id } = changes;
      if (stream_id) {
        if (stream_id.newValue) {
          this.setState({ streamId: stream_id.newValue, isLoading: false });
        } else {
          this.setState({ streamId: null });
          this.getServiceToken();
        }
      }
    });
  }

  componentDidMount() {
    this.getStreamId();
    this.setupStreamIdChangeHandler();
  }

  renderLoading() {
    return <div>Loading</div>;
  }

  renderStreamCode() {
    const { streamId } = this.state;
    return (
      <div>
        <QRCode value={`subreader://${streamId}`} />
      </div>
    );
  }

  renderAuthCode() {
    const { authId } = this.state;
    return (
      <div>
        <QRCode value={`subreader://authenticate?id=${authId}`} />
      </div>
    );
  }

  render() {
    const { isLoading, streamId } = this.state;
    return (
      <div style={styles.container}>
        <img src="logo.png" style={styles.logoImg} />
        {isLoading
          ? this.renderLoading()
          : streamId
            ? this.renderStreamCode()
            : this.renderAuthCode()}
      </div>
    );
  }
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  },
  logoImg: { width: "164px", marginBottom: "10px" }
};

ReactDOM.render(<Popup />, document.getElementById("app"));
