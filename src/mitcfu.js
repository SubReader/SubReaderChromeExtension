const { activateHTML5 } = require("./html5");
const code = require("raw-loader!babel-loader!./interceptors/mitcfu");
const script = document.createElement("script");
script.textContent = code;

document.body.append(script);

const service = "mitcfu";

activateHTML5({ service });

function sendMessage({ action, payload }) {
  chrome.runtime.sendMessage({
    action,
    payload,
    service
  });
}

window.addEventListener("subtitles", ({ detail: subtitles }) => {
  sendMessage({ action: "subtitles", payload: subtitles });
});

window.addEventListener("info", ({ detail: info }) => {
  sendMessage({ action: "info", payload: info });
});
