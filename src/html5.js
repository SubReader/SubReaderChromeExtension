const _ = require("lodash");

function activateHTML5({ service }) {
  let found = false;

  new MutationObserver(() => {
    const video = document.querySelector("video[src]");
    if (!video && found) {
      found = false;
      chrome.runtime.sendMessage({
        action: "state",
        service,
        payload: {
          time: 0,
          playing: false
        }
      });
    }

    if (video && !found) {
      console.log("Found video", video);
      found = true;
      const onTime = _.throttle(() => {
        chrome.runtime.sendMessage({
          action: "state",
          service,
          payload: {
            time: Math.floor(video.currentTime * 1000),
            playing: !video.paused && !video.ended
          }
        });
      }, 5000);

      video.addEventListener("timeupdate", () => onTime());
      video.addEventListener("play", () => {
        chrome.runtime.sendMessage({
          action: "state",
          service,
          payload: {
            time: Math.floor(video.currentTime * 1000),
            playing: true
          }
        });
      });

      video.addEventListener("pause", () => {
        chrome.runtime.sendMessage({
          action: "state",
          service,
          payload: {
            time: Math.floor(video.currentTime * 1000),
            playing: false
          }
        });
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
}

module.exports = {
  activateHTML5
};
