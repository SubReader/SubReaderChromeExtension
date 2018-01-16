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
    "service_token",
    ({ service_token: serviceToken }) => {
      if (serviceToken) {
        observer.next(serviceToken);
      }
    }
  );

  return () => {
    chrome.storage.onChanged.removeListener(handleStorageChange);
  };
});

const streamToken$ = serviceToken$
  .map(serviceToken => {
    return Observable.fromPromise(SubReaderAPI.getStreamToken(serviceToken));
  })
  .switch();

const stream$ = Observable.combineLatest(state$, subtitles$, streamToken$)
  .first()
  .map(([state, subtitles, { token, id: streamId }]) => {
    chrome.storage.sync.set({ streamId });
    const stream = new SubReaderAPI.Stream(token, streamId);
    stream.setSubtitles(subtitles);
    return stream;
  });

stream$.subscribe(stream => {
  console.log("Stream", stream);

  subtitles$.subscribe(subtitles => {
    console.log("Subtitle", subtitles);
    stream.setSubtitles(subtitles);
  });

  state$.subscribe(state => {
    console.log("State", state);
    stream.setState(state);
  });
});
