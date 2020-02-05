import SubReader from "subreader-api";

import { ACTION, SERVICE, STATUS } from "./types/enums";
import { IStreamEntry } from "./types";
import { authorizedClient } from "./popup/client";
import { getDefaultTitleForService } from "./background/utils";
import { CREATE_USER_STREAM } from "./background/queries";
import { CREATE_REEPAY_RECURRING_SESSION_FOR_COUNTRY } from "./popup/Test/queries";


const openedStreams: Array<IStreamEntry> = [];

function getStreamEntry(id: string, service: SERVICE, stream: any): IStreamEntry {
  for (const entry of openedStreams) {
    if (entry.id === id && entry.status === STATUS.RESOLVED && !entry.supportedServices.includes(service)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entry.stream!.setState({ playing: false, time: 0 });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entry.stream!.socket.close();
      entry.status = STATUS.CLOSED;
    }
  }

  const entry = openedStreams.find(entry => {
    return (
      entry.id === id
      && entry.supportedServices.includes(service)
      && (entry.status === STATUS.PENDING || entry.status === STATUS.RESOLVED)
    );
  });

  if (entry) {
    return entry;
  }

  const newEntry = {
    id,
    supportedServices: [service],
    status: STATUS.PENDING,
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

      newEntry.status = STATUS.RESOLVED;
      newEntry.stream = stream;
      newEntry.supportedServices = supportedServices;
    })
    .catch(error => {
      newEntry.status = STATUS.REJECTED;
      newEntry.error = error;
    });

  return newEntry;
}

chrome.tabs.onRemoved.addListener((tabId: string) => {
  openedStreams
    .filter(entry => entry.id === tabId && entry.status === "resolved")
    .forEach(entry => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entry.stream!.setState({ playing: false, time: 0 });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entry.stream!.socket.close();
      entry.status = STATUS.CLOSED;
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
        break;
      }

      case ACTION.GET_PAYMENT_URL: {
        const plan = payload;
        const PAYMENT_ACCEPT_URL = "https://api.subreader.dk/accept";
        const PAYMENT_CANCEL_URL = "https://api.subreader.dk/cancel";

        authorizedClient
          .mutate({
            mutation: CREATE_REEPAY_RECURRING_SESSION_FOR_COUNTRY,
            variables: {
              country: plan.country,
              buttonText: "Save card",
              acceptURL: `${PAYMENT_ACCEPT_URL}?country=${plan.country}&reepay_plan_ID=${plan.reepayPlanIDs[plan.country]}&plan=${encodeURIComponent(JSON.stringify(plan))}`,
              cancelURL: PAYMENT_CANCEL_URL,
            },
          })
          .then(({ data }) => {
            sendResponse(data.createReepayRecurringSession);
          });

        break;
      }
    }
    return true;
  },
);
