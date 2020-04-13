// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import code from "raw-loader!babel-loader!./interceptors/filmochskola";

import { activateHTML5 } from "./utils/html5";
import { ACTION, SERVICE } from "../types/enums";


const service = SERVICE.FILM_OCH_SKOLA;

activateHTML5(service);

const script = document.createElement("script");
script.textContent = code;
document.body.appendChild(script);

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
