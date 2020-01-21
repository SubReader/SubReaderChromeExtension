import React from "react";
import ReactDOM from "react-dom";
import client from "./client";
import { ApolloProvider } from "react-apollo";
import Popup from "./Popup";


function Entry() {
  return (
    <ApolloProvider client={client}>
      <Popup />
    </ApolloProvider>
  );
}

ReactDOM.render(<Entry />, document.getElementById("app"));
