const code = require("raw-loader!babel-loader!./interceptors/drtv");
const script = document.createElement("script");
script.textContent = code;

function sendMessage({ action, payload }) {
  chrome.runtime.sendMessage({
    action,
    payload,
    service: "drtv"
  });
}

window.addEventListener("subtitles", ({ detail: subtitles }) => {
  sendMessage({ action: "subtitles", payload: subtitles });
});

window.addEventListener("info", ({ detail: info }) => {
  sendMessage({ action: "info", payload: info });
});

document.body.appendChild(script);
