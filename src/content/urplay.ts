// eslint-disable-next-line import/default
import fetch from "isomorphic-fetch";
import { parse } from "node-webvtt";

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import code from "raw-loader!babel-loader!./interceptors/urplay";

import { activateHTML5 } from "./utils/html5";
import { ACTION, SERVICE } from "../types/enums";


const script = document.createElement("script");
script.textContent = code;
document.body.appendChild(script);

const service = SERVICE.URPLAY;

activateHTML5(service);

function sendMessage({ action, payload }: { action: ACTION; payload: any }): void {
  chrome.runtime.sendMessage({
    action,
    payload,
    service,
  });
}

// @ts-ignore
window.addEventListener("vtt-tracks", ({ detail }) => {
  Promise.all(
    detail.map((track: any) => {
      return fetch(track.url)
        .then(res => res.text())
        .then(text => {
          const vtt = parse(text);
          return {
            language: track.language,
            cues: vtt.cues.map((cue: any) => {
              return {
                text: cue.text,
                timeIn: (cue.start * 1000) | 0,
                timeOut: (cue.end * 1000) | 0,
              };
            }),
          };
        });
    }),
  ).then(subtitles => {
    sendMessage({ action: ACTION.SUBTITLES, payload: subtitles });
  });
});

// @ts-ignore
window.addEventListener("info", ({ detail }) => {
  sendMessage({ action: ACTION.INFO, payload: detail });
});
