// eslint-disable-next-line import/default
import _ from "lodash";

import { SERVICE, ACTION } from "../../types/enums";


const getVideoElement = (service: SERVICE): HTMLVideoElement | null => {
  let video: HTMLVideoElement | null = document.querySelector("video[src]");

  if (service === "mitcfu" && !video) {
    const iframe: HTMLIFrameElement | null = document.querySelector("#MitCFUPlayer_ifp");
    if (iframe && iframe.contentWindow) {
      const iframeVideo: HTMLVideoElement | null = iframe.contentWindow.document.querySelector("video[src]");
      if (iframeVideo) video = iframeVideo;
    }
  }
  return video;
};

export function activateHTML5(service: SERVICE): void {
  let found = false;

  new MutationObserver(() => {
    const video = getVideoElement(service);

    if (!video && found) {
      found = false;
      chrome.runtime.sendMessage({
        action: ACTION.STATE,
        service,
        payload: {
          time: 0,
          playing: false,
        },
      });
    }

    if (video && !found) {
      console.info("Found video", video);
      found = true;
      const onTime = _.throttle(() => {
        chrome.runtime.sendMessage({
          action: ACTION.STATE,
          service,
          payload: {
            time: Math.floor(video.currentTime * 1000),
            playing: !video.paused && !video.ended,
          },
        });
      }, 5000);

      video.addEventListener("timeupdate", () => onTime());
      video.addEventListener("play", () => {
        chrome.runtime.sendMessage({
          action: ACTION.STATE,
          service,
          payload: {
            time: Math.floor(video.currentTime * 1000),
            playing: true,
          },
        });
      });

      video.addEventListener("pause", () => {
        chrome.runtime.sendMessage({
          action: ACTION.STATE,
          service,
          payload: {
            time: Math.floor(video.currentTime * 1000),
            playing: false,
          },
        });
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
}
