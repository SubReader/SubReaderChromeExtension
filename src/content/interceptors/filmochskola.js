(function() {
  let found = false;
  // eslint-disable-next-line no-undef
  const observer = new MutationObserver(() => {
    if (found) return;
    const videoEl = document.getElementById("fullVideo");
    if (videoEl) {
      found = true;
      const video = window.videojs(videoEl);
      const title = document.querySelector(".movie-content .title").textContent;
      const textTracks = video.textTracks();

      window.dispatchEvent(
        new CustomEvent("info", {
          detail: {
            title: title,
            cover: {
              uri: video.poster(),
            },
            backdrop: {
              uri: video.poster(),
            },
          },
        }),
      );

      const handleAddTrack = () => {
        for (let i = 0; i < textTracks.length; i++) {
          const textTrack = textTracks[i];
          if (textTrack.mode === "hidden") continue;

          let lastCue;

          const handleLoad = () => {
            if (textTrack.cues[0] === lastCue) return;
            lastCue = textTrack.cues[0];

            const cues = [];
            for (let i = 0; i < textTrack.cues.length; i++) {
              const cue = textTrack.cues[i];
              const div = document.createElement("div");
              div.innerHTML = cue.text;
              cues.push({
                text: div.innerText,
                timeIn: Math.floor(cue.startTime * 1000),
                timeOut: Math.floor(cue.endTime * 1000),
              });
            }

            window.dispatchEvent(
              new CustomEvent("subtitles", {
                detail: [
                  {
                    language: textTrack.language,
                    cues,
                  },
                ],
              }),
            );
          };

          textTrack.oncuechange = handleLoad;
          textTrack.addEventListener("loadeddata", handleLoad);
        }
      };

      textTracks.addEventListener("addtrack", handleAddTrack);
      handleAddTrack();
    }
  });

  observer.observe(document, {
    subtree: true,
    childList: true,
  });
})();
