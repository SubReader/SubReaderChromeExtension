import { Observable, defer, concat, combineLatest } from "rxjs";
import { switchMap, map, share, filter } from "rxjs/operators";
import { on$ } from "./communication";
import * as SubReaderAPI from "subreader-api";

const subtitles$ = on$(["subtitles"]);
const info$ = on$(["info"]);
const state$ = on$(["state"]);

const serviceTokenInitial$ = Observable.create(observer => {
  chrome.storage.local.get(
    ["service_token", "service_token_expiration"],
    ({ service_token, service_token_expiration }) => {
      if (service_token && service_token_expiration) {
        observer.next({
          service_token,
          service_token_expiration
        });
      }
      observer.complete();
    }
  );
});

const serviceTokenChanges$ = Observable.create(observer => {
  function handleStorageChange(changes, namespace) {
    const { service_token, service_token_expiration } = changes;
    if (
      service_token &&
      service_token_expiration &&
      service_token.newValue &&
      service_token_expiration.newValue
    ) {
      observer.next({
        service_token: service_token.newValue,
        service_token_expiration: service_token_expiration.newValue
      });
    }
  }
  chrome.storage.onChanged.addListener(handleStorageChange);
  return () => {
    chrome.storage.onChanged.removeListener(handleStorageChange);
  };
});

const serviceToken$ = concat(serviceTokenInitial$, serviceTokenChanges$).pipe(
  share()
);

const stream$ = serviceToken$.pipe(
  filter(({ service_token_expiration }) => {
    return service_token_expiration > Date.now();
  }),
  map(({ service_token }) => service_token),
  switchMap(service_token => {
    return defer(() => {
      return SubReaderAPI.getStreamToken(service_token);
    });
  }),
  map(({ token, id }) => {
    return new SubReaderAPI.Stream(token, id);
  }),
  share()
);

serviceToken$.subscribe(({ service_token_expiration }) => {
  if (service_token_expiration <= Date.now()) {
    chrome.storage.local.remove("stream_id");
  }
});

stream$.subscribe(stream => {
  console.log("Stream", stream);
  chrome.storage.local.set({ stream_id: stream.id });
});

combineLatest(stream$, subtitles$).subscribe(([stream, subtitles]) => {
  console.log("Subtitles", subtitles);
  stream.setSubtitles(subtitles);
});

combineLatest(stream$, state$).subscribe(([stream, state]) => {
  console.log("State", state);
  stream.setState(state);
});

combineLatest(stream$, info$).subscribe(([stream, info]) => {
  console.log("Info", info);
  stream.setInfo({
    title: "Chrome Video",
    backdrop: {
      uri: "https://static.subreader.dk/placeholder-placeholder.jpg"
    },
    cover: {
      uri: "https://static.subreader.dk/placeholder-cover.jpg"
    },
    ...info
  });
});
