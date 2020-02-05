import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";
import { observableFromPromise } from "../background/utils";
import { REFRESH_ACCESS_TOKEN } from "../background/queries";


const httpLink = new HttpLink({ uri: "https://api.subreader.dk" });
const authLink = new ApolloLink((operation, forward) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return observableFromPromise(getAccessToken()).flatMap((accessToken: string) => {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return forward(operation);
  });
});

const cache = new InMemoryCache();

export const authorizedClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});
export const client = new ApolloClient({
  link: httpLink,
  cache,
});

function getAccessToken(): Promise<string> {
  return new Promise(resolve => {
    function handleAddAccessToken(changes: { accessToken: { newValue: string } }): void {
      const { accessToken } = changes;
      if (accessToken && accessToken.newValue) {
        // @ts-ignore
        chrome.storage.onChanged.removeListener(handleAddAccessToken);
        resolve(accessToken.newValue);
      }
    }

    chrome.storage.sync.get(
      ["accessToken", "expirationDate", "refreshToken"],
      async ({
        accessToken,
        expirationDate,
        refreshToken,
      }: {
        accessToken: string;
        expirationDate: string;
        refreshToken: string;
      }) => {
        if (accessToken) {
          if (new Date(expirationDate) <= new Date()) {
            const { data } = await client.mutate({
              mutation: REFRESH_ACCESS_TOKEN,
              variables: {
                refreshToken,
              },
            });
            const { refreshAccessToken } = data;
            const { accessToken } = refreshAccessToken;

            // @ts-ignore
            chrome.storage.sync.set(
              {
                accessToken: accessToken.value,
                expirationDate: new Date(Date.now() + accessToken.expiresIn * 1000).toISOString(),
              },
              () => {
                resolve(accessToken.value);
              },
            );
          } else {
            resolve(accessToken);
          }
        } else {
          // Subscribe to accessToken updates
          // @ts-ignore
          chrome.storage.onChanged.addListener(handleAddAccessToken);
        }
      },
    );
  });
}
