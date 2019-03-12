(function() {
  function getSubtitles(tracks) {
    return Promise.all(
      tracks.map(track => {
        return new Promise(resolve => {
          function handleCues() {
            const cues = [];
            for (let i = 0; i < track.cues.length; i++) {
              const cue = track.cues[i];
              const div = document.createElement("div");
              div.innerHTML = cue.text;
              cues.push({
                text: div.innerText,
                timeIn: Math.floor(cue.startTime * 1000),
                timeOut: Math.floor(cue.endTime * 1000)
              });
            }
            track.oncuechange = null;
            track.removeEventListener("loadeddata", handleCues);
            resolve({
              language: track.language,
              cues
            });
          }
          track.oncuechange = handleCues;
          track.addEventListener("loadeddata", handleCues);
        });
      })
    );
  }

  class CodeLock {
    constructor() {
      this.code = 0;
    }
    lock() {
      return ++this.code;
    }
    getCode() {
      return this.code;
    }
    unlock() {
      this.code = 0;
    }
  }

  let found = false;
  const observer = new MutationObserver(() => {
    if (found) return;
    const videoEl = document.getElementById("core-video-element");
    if (videoEl) {
      found = true;
      const video = window["videojs"](videoEl);
      const title = document.getElementById("player-title").textContent;
      const textTracks = video.textTracks();

      const { poster } = video.options_;
      window.dispatchEvent(
        new CustomEvent("info", {
          detail: {
            title: title,
            cover: {
              uri: poster
            },
            backdrop: {
              uri: poster
            }
          }
        })
      );

      const lock = new CodeLock();
      function handleAddTrack() {
        const code = lock.lock();
        const tracks = [];
        for (let i = 0; i < textTracks.length; i++) {
          const track = textTracks[i];
          if (track.mode === "hidden") continue;
          tracks.push(track);
        }
        getSubtitles(tracks).then(subtitles => {
          if (code === lock.getCode()) {
            lock.unlock();
            window.dispatchEvent(
              new CustomEvent("subtitles", {
                detail: subtitles
              })
            );
          }
        });
      }

      textTracks.addEventListener("addtrack", handleAddTrack);
      handleAddTrack();
    }
  });
  observer.observe(document, {
    subtree: true,
    childList: true
  });
})();
