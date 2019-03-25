import SubReader from "subreader-api";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink
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

function getStreamEntry(id, service, stream) {
  for (const entry of openedStreams) {
    if (
      entry.id == id &&
      entry.status == "resolved" &&
      !entry.supportedServices.includes(service)
    ) {
      entry.stream.setState({ playing: false, time: 0 });
      entry.stream.socket.close();
      entry.status = "closed";
    }
  }

  const entry = openedStreams.find(entry => {
    return (
      entry.id == id &&
      entry.supportedServices.includes(service) &&
      (entry.status == "pending" || entry.status == "resolved")
    );
  });

  if (entry) return entry;

  const newEntry = {
    id,
    supportedServices: [service],
    status: "pending"
  };

  openedStreams.push(newEntry);

  authorizedClient
    .mutate({
      mutation: gql`
        mutation CreateUserStream($stream: UserStreamInput, $service: String!) {
          createUserStream(stream: $stream, service: $service) {
            stream {
              id
            }
            streamToken {
              value
            }
            supportedServices
          }
        }
      `,
      variables: {
        service,
        stream
      }
    })
    .then(({ data }) => {
      const { createUserStream } = data;
      const {
        stream: streamInfo,
        streamToken,
        supportedServices
      } = createUserStream;
      const stream = new SubReader.Stream(streamToken.value, streamInfo.id);

      newEntry.status = "resolved";
      newEntry.stream = stream;
      newEntry.supportedServices = supportedServices;
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
      entry.stream.setState({ playing: false, time: 0 });
      entry.stream.socket.close();
      entry.status = "closed";
    });
});

// @ts-ignore
chrome.runtime.onMessage.addListener(
  async ({ action, service, payload }, sender, sendResponse) => {
    console.log(service, action);
    switch (action) {
      case "info": {
        console.log("Setting info", payload);
        const info = {
          title: getDefaultTitleForService(service),
          backdrop: {
            uri: "https://static.subreader.dk/placeholder-placeholder.jpg"
          },
          cover: {
            uri: "https://static.subreader.dk/placeholder-cover.jpg"
          },
          ...payload
        };
        const { stream } = getStreamEntry(sender.tab.id, service, { info });
        if (stream) {
          stream.setInfo(info);
        }
        break;
      }
      case "subtitles": {
        console.log("Setting subtitles", payload);
        const subtitles = payload;
        const { stream } = getStreamEntry(sender.tab.id, service, {
          subtitles
        });
        if (stream) {
          stream.setSubtitles(subtitles);
        }
        break;
      }
      case "state": {
        console.log("Setting state", payload);
        const state = payload;
        const { stream } = getStreamEntry(sender.tab.id, service, { state });
        if (stream) {
          stream.setState(state);
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
