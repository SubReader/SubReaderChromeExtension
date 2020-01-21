const code = require("raw-loader!babel-loader!./interceptors/filmcentralen");
const webvtt = require("node-webvtt");
const script = document.createElement("script");
const { activateHTML5 } = require("./html5");
script.textContent = code;

const service = "filmcentralen";
activateHTML5({ service });

function sendMessage({ action, payload }) {
  chrome.runtime.sendMessage({
    action,
    payload,
    service
  });
}

window.addEventListener("state", ({ detail: state }) => {
  sendMessage({ action: "state", payload: state });
});

window.addEventListener("vtt-subtitles", ({ detail: vttSubtitles }) => {
  // Test
  const subtitles = vttSubtitles
    .map(({ language, vtt }) => {
      try {
        const sub = webvtt.parse(vtt);
        return {
          language,
          ...sub,
          valid: true
        };
      } catch (error) {
        console.error(error);
        return {
          valid: false
        };
      }
    })
    .filter(s => s.valid)
    .map(s => ({
      language: s.language,
      cues: s.cues.map(cue => ({
        text: cue.text,
        timeIn: cue.start * 1000,
        timeOut: cue.end * 1000
      }))
    }));
  sendMessage({ action: "subtitles", payload: subtitles });
});

window.addEventListener("info", ({ detail: info }) => {
  sendMessage({ action: "info", payload: info });
});

document.body.appendChild(script);
