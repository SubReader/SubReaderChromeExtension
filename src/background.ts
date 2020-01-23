import SubReader from "subreader-api";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "apollo-boost";
import { ACTION, SERVICE } from "./background/types";
import { getDefaultTitleForService, observableFromPromise } from "./background/utils";
import { CREATE_USER_STREAM, REFRESH_ACCESS_TOKEN } from "./background/queries";


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
const authorizedClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});
const client = new ApolloClient({
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

interface IStreamEntry {
  id: string;
  status: string;
  supportedServices: Array<string>;
  stream: any;
  error?: Error | null;
}

const openedStreams: Array<IStreamEntry> = [];

function getStreamEntry(id: string, service: string, stream: any): IStreamEntry {
  for (const entry of openedStreams) {
    if (entry.id === id && entry.status === "resolved" && !entry.supportedServices.includes(service)) {
      entry.stream.setState({ playing: false, time: 0 });
      entry.stream.socket.close();
      entry.status = "closed";
    }
  }

  const entry = openedStreams.find(entry => {
    return (
      entry.id === id
      && entry.supportedServices.includes(service)
      && (entry.status === "pending" || entry.status === "resolved")
    );
  });

  if (entry) {
    return entry;
  }

  const newEntry = {
    id,
    supportedServices: [service],
    status: "pending",
    stream: null,
    error: null,
  };

  openedStreams.push(newEntry);

  authorizedClient
    .mutate({
      mutation: CREATE_USER_STREAM,
      variables: {
        service,
        stream,
      },
    })
    .then(({ data }) => {
      const { createUserStream } = data;
      const { stream: streamInfo, streamToken, supportedServices } = createUserStream;
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
    .filter(entry => entry.id === tabId && entry.status === "resolved")
    .forEach(entry => {
      entry.stream.setState({ playing: false, time: 0 });
      entry.stream.socket.close();
      entry.status = "closed";
    });
});

chrome.runtime.onMessage.addListener(
  (
    { action, service, payload }: { action: ACTION; service: SERVICE; payload: any },
    sender: any,
    sendResponse: (data: any) => void,
  ): boolean => {
    console.info(service, action);
    switch (action) {
      case ACTION.INFO: {
        console.info("Setting info", payload);
        const info = {
          title: getDefaultTitleForService(service),
          backdrop: {
            uri: "https://static.subreader.dk/placeholder-placeholder.jpg",
          },
          cover: {
            uri: "https://static.subreader.dk/placeholder-cover.jpg",
          },
          ...payload,
        };
        const { stream } = getStreamEntry(sender.tab.id, service, { info });
        if (stream) {
          stream.setInfo(info);
        }
        break;
      }
      case ACTION.SUBTITLES: {
        console.info("Setting subtitles", payload);
        const subtitles = payload;
        const { stream } = getStreamEntry(sender.tab.id, service, {
          subtitles,
        });
        if (stream) {
          stream.setSubtitles(subtitles);
        }
        break;
      }
      case ACTION.STATE: {
        console.info("Setting state", payload);
        const state = payload;
        const { stream } = getStreamEntry(sender.tab.id, service, { state });
        if (stream) {
          stream.setState(state);
        }
        break;
      }
      case ACTION.PROMOTE: {
        console.info("Promoting stream", payload);
        break;
      }

      case ACTION.GET_STREAMS: {
        sendResponse({
          streams: openedStreams.map(entry => ({
            ...entry,
            stream: entry.stream
              ? {
                id: entry.stream.id,
              }
              : null,
          })),
        });
      }
    }
    return true;
  },
);
