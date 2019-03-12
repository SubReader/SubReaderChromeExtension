// @ts-nocheck
const { activateHTML5 } = require("./html5");
const fetch = require("isomorphic-fetch");
const samiParser = require("sami-parser");
const code = require("raw-loader!babel-loader!./interceptors/viaplay");
const script = document.createElement("script");
script.textContent = code;

const service = "viaplay";

activateHTML5({ service });

function sendMessage({ action, payload }) {
  chrome.runtime.sendMessage({
    action,
    payload,
    service
  });
}

function parseText(text) {
  const div = document.createElement("div");
  div.innerHTML = text;
  return div.innerText;
}

window.addEventListener("sami-subtitles", ({ detail: samiSubtitles }) => {
  const subtitles = samiSubtitles.map(samiSub => {
    return {
      language: samiSub.language,
      cues: samiParser.parse(samiSub.sami).result.map(res => {
        return {
          text: parseText(res.languages[Object.keys(res.languages)[0]]),
          timeIn: res.startTime,
          timeOut: res.endTime
        };
      })
    };
  });

  sendMessage({
    action: "subtitles",
    payload: subtitles
  });
});

window.addEventListener("info", ({ detail: info }) => {
  sendMessage({
    action: "info",
    payload: info
  });
});

document.body.appendChild(script);
