const code = require("raw-loader!babel-loader!./interceptors/hbonordic");
const script = document.createElement("script");
script.textContent = code;

window.addEventListener("state", ({ detail: state }) => {
  chrome.runtime.sendMessage({ action: "state", payload: state });
});

window.addEventListener("subtitles", ({ detail: subtitles }) => {
  chrome.runtime.sendMessage({ action: "subtitles", payload: subtitles });
});

document.body.appendChild(script);
