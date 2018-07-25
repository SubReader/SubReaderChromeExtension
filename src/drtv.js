const code = require("raw-loader!babel-loader!./interceptors/drtv");
const script = document.createElement("script");
script.textContent = code;

window.addEventListener("subtitles", ({ detail: subtitles }) => {
  chrome.runtime.sendMessage({ action: "subtitles", payload: subtitles });
});

window.addEventListener("info", ({ detail: info }) => {
  chrome.runtime.sendMessage({ action: "info", payload: info });
});

document.body.appendChild(script);
