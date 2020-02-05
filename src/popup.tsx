import * as React from "react";
import * as ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";

import client from "./popup/client";
import { Popup } from "./popup/Popup";


const Entry: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Popup />
    </ApolloProvider>
  );
};

ReactDOM.render(<Entry />, document.getElementById("app"));
