import { Observable } from "rxjs";

export function on(actions, callback) {
  chrome.runtime.onMessage.addListener(
    ({ action, payload }, sender, sendResponse) => {
      if (actions.includes(action)) {
        callback(action, payload, sender, sendResponse);
      }
    }
  );
}

export function on$(actions) {
  return Observable.create(observer => {
    on(actions, (action, payload, sender, sendResponse) => {
      observer.next(payload);
    });
  });
}
