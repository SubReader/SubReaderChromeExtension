import samiParser from "sami-parser";

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import code from "raw-loader!babel-loader!./interceptors/viaplay";

import { activateHTML5 } from "./html5";
import { ACTION, SERVICE } from "./types/enums";


const script = document.createElement("script");
script.textContent = code;
document.body.appendChild(script);

const service = SERVICE.VIAPLAY;

activateHTML5(service);

function sendMessage({ action, payload }: { action: ACTION; payload: any }): void {
  chrome.runtime.sendMessage({
    action,
    payload,
    service,
  });
}

function parseText(text: string): string {
  const div = document.createElement("div");
  div.innerHTML = text;
  return div.innerText;
}

// @ts-ignore
window.addEventListener("sami-subtitles", ({ detail }) => {
  const subtitles = detail.map((samiSub: any) => {
    return {
      language: samiSub.language,
      cues: samiParser.parse(samiSub.sami).result.map((res: any) => {
        return {
          text: parseText(res.languages[Object.keys(res.languages)[0]]),
          timeIn: res.startTime,
          timeOut: res.endTime,
        };
      }),
    };
  });

  sendMessage({
    action: ACTION.SUBTITLES,
    payload: subtitles,
  });
});

// @ts-ignore
window.addEventListener("info", ({ detail }) => {
  sendMessage({
    action: ACTION.INFO,
    payload: detail,
  });
});
