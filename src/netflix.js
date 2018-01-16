const code = require("raw-loader!babel-loader!./interceptors/netflix");
const script = document.createElement("script");
script.textContent = code;
document.body.appendChild(script);

window.addEventListener("subtitles", ({ detail: subtitles }) => {
  chrome.runtime.sendMessage({ action: "subtitles", payload: subtitles });
});
