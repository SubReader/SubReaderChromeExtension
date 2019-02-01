(function() {
  try {
    const player = window.theoplayer(document.getElementById("lS3MS"));
    const titleEl = document.getElementsByClassName("node-title")[0];

    window.dispatchEvent(
      new CustomEvent("info", {
        detail: {
          title: titleEl.textContent.trim()
        }
      })
    );

    function handlePlaybackState() {
      window.dispatchEvent(
        new CustomEvent("state", {
          detail: {
            playing: !player.paused,
            time: Math.floor(player.currentTime * 1000)
          }
        })
      );
    }

    player.addEventListener("play", handlePlaybackState);
    player.addEventListener("pause", handlePlaybackState);

    const subtitles = [];
    for (const textTrack of player.textTracks) {
      if (textTrack.language) {
        subtitles.push(
          new Promise((resolve, reject) => {
            textTrack.addEventListener("load", function handleLoad() {
              const cues = [];
              for (let i = 0; i < textTrack.cues.length; i++) {
                const cue = textTrack.cues[i];
                cues.push({
                  text: cue.text,
                  timeIn: Math.floor(cue.startTime * 1000),
                  timeOut: Math.floor(cue.endTime * 1000)
                });
              }

              const subtitle = {
                language: textTrack.language,
                cues
              };
              resolve(subtitle);
            });
          })
        );
      }
    }

    const readySubtitles = [];
    subtitles.forEach(subtitle => {
      subtitle.then(sub => {
        readySubtitles.push(sub);
        window.dispatchEvent(
          new CustomEvent("subtitles", { detail: readySubtitles })
        );
      });
    });
  } catch (error) {
    console.error(error);
  }
})();
