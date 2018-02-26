const code = require("raw-loader!babel-loader!./interceptors/netflix");
const script = document.createElement("script");
script.textContent = code;

window.addEventListener("subtitles", ({ detail: subtitles }) => {
  chrome.runtime.sendMessage({ action: "subtitles", payload: subtitles });
});

document.body.appendChild(script);
