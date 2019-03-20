import { Stream } from "subreader-api";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  Observable
} from "apollo-boost";
import gql from "graphql-tag";
import { observableFromPromise, getDefaultTitleForService } from "./utils";

const httpLink = new HttpLink({ uri: "https://api.subreader.dk" });
const authLink = new ApolloLink((operation, forward) => {
  return observableFromPromise(getAccessToken()).flatMap(accessToken => {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return forward(operation);
  });
});

const cache = new InMemoryCache();
const authorizedClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
});
const client = new ApolloClient({
  link: httpLink,
  cache
});

function getAccessToken() {
  return new Promise(resolve => {
    // @ts-ignore
    chrome.storage.sync.get(
      ["accessToken", "expirationDate", "refreshToken"],
      async ({ accessToken, expirationDate, refreshToken }) => {
        if (accessToken) {
          if (new Date(expirationDate) <= new Date()) {
            const { data } = await client.mutate({
              mutation: gql`
                mutation RefreshAccessToken($refreshToken: String!) {
                  refreshAccessToken(refreshToken: $refreshToken) {
                    accessToken {
                      value
                      expiresIn
                    }
                  }
                }
              `,
              variables: {
                refreshToken
              }
            });
            const { refreshAccessToken } = data;
            const { accessToken } = refreshAccessToken;

            // @ts-ignore
            chrome.storage.sync.set(
              {
                accessToken: accessToken.value,
                expirationDate: new Date(
                  Date.now() + accessToken.expiresIn * 1000
                ).toISOString()
              },
              () => {
                resolve(accessToken.value);
              }
            );
          } else {
            resolve(accessToken);
          }
        } else {
          function handleAddAccessToken(changes) {
            const { accessToken } = changes;
            if (accessToken && accessToken.newValue) {
              // @ts-ignore
              chrome.storage.onChanged.removeListener(handleAddAccessToken);
              resolve(accessToken.newValue);
            }
          }

          // Subscribe to accessToken updates
          // @ts-ignore
          chrome.storage.onChanged.addListener(handleAddAccessToken);
        }
      }
    );
  });
}

let openedStreams = [];

function getStreamEntry(id, service) {
  const entry = openedStreams.find(entry => {
    return entry.id == id && entry.service == service;
  });
  if (entry) return entry;

  const newEntry = {
    id,
    service,
    status: "pending"
  };

  openedStreams.push(newEntry);

  authorizedClient
    .mutate({
      mutation: gql`
        mutation CreateUserStream(
          $stream: UserStreamInput
          $requiredFeatures: [String]
        ) {
          createUserStream(
            stream: $stream
            requiredFeatures: $requiredFeatures
          ) {
            stream {
              id
            }
            streamToken {
              value
            }
          }
        }
      `,
      variables: {
        requiredFeatures: [service]
      }
    })
    .then(({ data }) => {
      const { createUserStream } = data;
      const { stream: streamInfo, streamToken } = createUserStream;
      const stream = new Stream(streamToken.value, streamInfo.id);

      newEntry.status = "resolved";
      newEntry.stream = stream;
    })
    .catch(error => {
      newEntry.status = "rejected";
      newEntry.error = error;
    });

  return newEntry;
}

// @ts-ignore
chrome.tabs.onRemoved.addListener(tabId => {
  openedStreams
    .filter(entry => entry.id == tabId && entry.status == "resolved")
    .forEach(entry => {
      entry.stream.socket.close();
    });

  openedStreams = openedStreams.filter(entry => entry.id !== tabId);
});

// @ts-ignore
chrome.runtime.onMessage.addListener(
  async ({ action, service, payload }, sender, sendResponse) => {
    console.log(service, action);
    switch (action) {
      case "info": {
        console.log("Setting info", payload);
        const { stream } = getStreamEntry(sender.tab.id, service);
        if (stream) {
          stream.setInfo({
            title: getDefaultTitleForService(service),
            backdrop: {
              uri: "https://static.subreader.dk/placeholder-placeholder.jpg"
            },
            cover: {
              uri: "https://static.subreader.dk/placeholder-cover.jpg"
            },
            ...payload
          });
        }
        break;
      }
      case "subtitles": {
        console.log("Setting subtitles", payload);
        const { stream } = getStreamEntry(sender.tab.id, service);
        if (stream) {
          stream.setSubtitles(payload);
        }
        break;
      }
      case "state": {
        console.log("Setting state", payload);
        const { stream } = getStreamEntry(sender.tab.id, service);
        if (stream) {
          stream.setState(payload);
        }
        break;
      }
      case "promote": {
        console.log("Promoting stream", payload);
        break;
      }

      case "getStreams": {
        sendResponse({
          streams: openedStreams.map(entry => ({
            ...entry,
            stream: entry.stream
              ? {
                  id: entry.stream.id
                }
              : null
          }))
        });
      }
    }
    return true;
  }
);
