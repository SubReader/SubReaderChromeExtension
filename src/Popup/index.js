import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import Popup from "./Popup";

const client = new ApolloClient({
  uri: "https://api.subreader.dk"
});

function Entry() {
  return (
    <ApolloProvider client={client}>
      <Popup />
    </ApolloProvider>
  );
}

ReactDOM.render(<Entry />, document.getElementById("app"));
