import { Observable } from "rx";
import { emit, on$ } from "./communication";
import * as SubReaderAPI from "subreader-api";

const subtitles$ = on$(["subtitles"]);
const info$ = on$(["info"]);
const state$ = on$(["state"]);

const serviceToken$ = Observable.create(observer => {
  function handleStorageChange(changes, namespace) {
    const { service_token: serviceToken } = changes;
    if (serviceToken) {
      observer.next(serviceToken.newValue);
    }
  }

  chrome.storage.onChanged.addListener(handleStorageChange);
  chrome.storage.sync.get(
    ["service_token", "service_token_expiration"],
    ({
      service_token: serviceToken,
      service_token_expiration: serviceTokenExpiration
    }) => {
      if (Date.now() >= serviceTokenExpiration) {
        chrome.storage.sync.remove([
          "service_token",
          "service_token_expiration",
          "stream_id"
        ]);
      } else if (serviceToken) {
        observer.next(serviceToken);
      }
    }
  );

  return () => {
    chrome.storage.onChanged.removeListener(handleStorageChange);
  };
});

const stream$ = serviceToken$
  .switchMap(serviceToken => {
    const streamToken$ = SubReaderAPI.getStreamToken(serviceToken);
    return Observable.fromPromise(streamToken$).catch(() => Observable.empty());
  })
  .map(({ token, id: streamId }) => {
    return new SubReaderAPI.Stream(token, streamId);
  });

stream$.subscribe(stream => {
  console.log("Stream", stream);
  chrome.storage.sync.set({ stream_id: stream.id });

  subtitles$.subscribe(subtitles => {
    console.log("Subtitle", subtitles);
    stream.setSubtitles(subtitles);
  });

  state$.subscribe(state => {
    console.log("State", state);
    stream.setState(state);
  });
});
