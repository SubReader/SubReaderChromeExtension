const { activateHTML5 } = require("./html5");

const fetch = require("isomorphic-fetch");
const { parse } = require("node-webvtt");

const code = require("raw-loader!babel-loader!./interceptors/urplay");
const script = document.createElement("script");
script.textContent = code;

const service = "urplay";

activateHTML5({ service });

function sendMessage({ action, payload }) {
  chrome.runtime.sendMessage({
    action,
    payload,
    service
  });
}

window.addEventListener("vtt-tracks", ({ detail: tracks }) => {
  Promise.all(
    tracks.map(track => {
      return fetch(track.url)
        .then(res => res.text())
        .then(text => {
          const vtt = parse(text);
          return {
            language: track.language,
            cues: vtt.cues.map(cue => {
              return {
                text: cue.text,
                timeIn: (cue.start * 1000) | 0,
                timeOut: (cue.end * 1000) | 0
              };
            })
          };
        });
    })
  ).then(subtitles => {
    console.log(subtitles);
    sendMessage({ action: "subtitles", payload: subtitles });
  });
});

window.addEventListener("info", ({ detail: info }) => {
  sendMessage({ action: "info", payload: info });
});

document.body.appendChild(script);
