import { Observable } from "rx"

export function emit(stream, action) {
  stream.subscribe(payload => {
    chrome.runtime.sendMessage({ action, payload })
  })
}

export function on(actions, callback) {
  chrome.runtime.onMessage.addListener(({ action, payload }, sender, sendResponse) => {
    if(actions.includes(action)) callback(action, payload, sender, sendResponse)
  })
}

export function on$(actions, fn) {
  return Observable.create(observer => {
    on(actions, (action, payload, sender, sendResponse) => {
      if(fn) {
        fn(observer, action, payload, sender, sendResponse)
      } else {
        observer.onNext(payload)
      }
    })
  })
}
