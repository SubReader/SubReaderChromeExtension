import React, { useState, createContext } from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import { IntlProvider } from "react-intl";
import { client } from "./popup/client";
import { Popup } from "./popup/Popup";
import { flattenMessages } from "./i18n/utils";
import * as supportedLocales from "./i18n";

type Locale = keyof typeof supportedLocales;
const locales = Object.keys(supportedLocales) as Array<Locale>;
const defaultLocale: Locale = locales.find(locale => navigator.languages[0].match(locale)) || "en";

export interface ILocaleContext {
  setLocale: (locale: Locale) => void;
  getLocale: () => Locale;
}

export const LocaleContext = createContext<ILocaleContext>(undefined!);

const Entry: React.FC = () => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const getLocale = (): Locale => locale;
  console.log(flattenMessages(supportedLocales[locale]));

  return (
    <LocaleContext.Provider
      value={{
        setLocale,
        getLocale,
      }}
    >
      <IntlProvider defaultLocale={defaultLocale} locale={locale} messages={flattenMessages(supportedLocales[locale])}>
        <ApolloProvider client={client}>
          <Popup />
        </ApolloProvider>
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

ReactDOM.render(<Entry />, document.getElementById("app"));
