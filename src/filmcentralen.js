// @ts-nocheck
const code = require("raw-loader!babel-loader!./interceptors/filmcentralen");
const script = document.createElement("script");
script.textContent = code;

function sendMessage({ action, payload }) {
  chrome.runtime.sendMessage({
    action,
    payload,
    service: "filmcentralen"
  });
}

window.addEventListener("state", ({ detail: state }) => {
  sendMessage({ action: "state", payload: state });
});

window.addEventListener("subtitles", ({ detail: subtitles }) => {
  sendMessage({ action: "subtitles", payload: subtitles });
});

window.addEventListener("info", ({ detail: info }) => {
  sendMessage({ action: "info", payload: info });
});

document.body.appendChild(script);
