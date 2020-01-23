import { activateHTML5 } from "./html5";
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import code from "raw-loader!babel-loader!./interceptors/netflix";
import { ACTION, SERVICE } from "./background/types";


const script = document.createElement("script");
script.textContent = code;
document.body.appendChild(script);

const service = SERVICE.NETFLIX;

activateHTML5({ service });

function sendMessage({ action, payload }: { action: ACTION; payload: any }): void {
  chrome.runtime.sendMessage({
    action,
    payload,
    service,
  });
}

// @ts-ignore
window.addEventListener("subtitles", ({ detail }) => {
  sendMessage({ action: ACTION.SUBTITLES, payload: detail });
});

// @ts-ignore
window.addEventListener("info", ({ detail }) => {
  sendMessage({ action: ACTION.INFO, payload: detail });
});
