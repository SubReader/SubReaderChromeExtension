import * as React from "react";
import * as ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";

import client from "./client";
import { Popup } from "./Popup";


const Entry: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Popup />
    </ApolloProvider>
  );
};

ReactDOM.render(<Entry />, document.getElementById("app"));
