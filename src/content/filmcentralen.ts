import { parse } from "node-webvtt";

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import code from "raw-loader!babel-loader!./interceptors/filmcentralen";

import { ACTION, SERVICE } from "../types/enums";
import { activateHTML5 } from "./utils/html5";


const script = document.createElement("script");
script.textContent = code;
document.body.appendChild(script);

const service = SERVICE.FILMCENTRALEN;

activateHTML5(service);

function sendMessage({ action, payload }: { action: ACTION; payload: any }): void {
  chrome.runtime.sendMessage({
    action,
    payload,
    service,
  });
}

// @ts-ignore
window.addEventListener("state", ({ detail }) => {
  sendMessage({ action: ACTION.STATE, payload: detail });
});

// @ts-ignore
window.addEventListener("vtt-subtitles", ({ detail }) => {
  // Test
  const subtitles = detail
    .map(({ language, vtt }: any) => {
      try {
        const sub = parse(vtt);
        return {
          language,
          ...sub,
          valid: true,
        };
      } catch (error) {
        console.error(error);
        return {
          valid: false,
        };
      }
    })
    .filter((s: any) => s.valid)
    .map((s: any) => ({
      language: s.language,
      cues: s.cues.map((cue: any) => ({
        text: cue.text,
        timeIn: cue.start * 1000,
        timeOut: cue.end * 1000,
      })),
    }));
  sendMessage({ action: ACTION.SUBTITLES, payload: subtitles });
});

// @ts-ignore
window.addEventListener("info", ({ detail }) => {
  sendMessage({ action: ACTION.INFO, payload: detail });
});
