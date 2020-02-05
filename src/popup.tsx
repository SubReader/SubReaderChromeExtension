import * as React from "react";
import * as ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import { IntlProvider } from "react-intl";

import { client } from "./popup/client";
import { Popup } from "./popup/Popup";
import { flattenMessages } from "./i18n/utils";
import { da } from "./i18n/da";


const Entry: React.FC = () => {
  return (
    <IntlProvider defaultLocale="da" locale="da" messages={flattenMessages(da)}>
      <ApolloProvider client={client}>
        <Popup />
      </ApolloProvider>
    </IntlProvider>
  );
};

ReactDOM.render(<Entry />, document.getElementById("app"));
