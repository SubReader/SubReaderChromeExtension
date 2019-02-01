(function() {
  function getTTMLSubtitle(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function() {
        resolve(this.response);
      };
      xhr.send();
    });
  }

  function parseTimestamp(timestamp) {
    const containsDot = timestamp.includes(".");
    const [hours, minutes, seconds, rest] = timestamp
      .split(/\:|\./)
      .map(x => parseInt(x));
    return (
      ((hours * 60 + minutes) * 60 + seconds) * 1000 +
      (containsDot ? rest : rest * 10)
    );
  }

  function parseTTMLCues(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const cues = Array.prototype.slice
      .call(doc.getElementsByTagName("p"))
      .map(el => {
        const textEl = document.createElement("div");
        textEl.innerHTML = el.innerHTML;
        return {
          timeIn: parseTimestamp(el.attributes.begin.value),
          timeOut: parseTimestamp(el.attributes.end.value),
          text: textEl.innerText
        };
      });
    return cues;
  }

  function dispatch(event, obj) {
    window.dispatchEvent(
      new CustomEvent(event, {
        detail: obj
      })
    );
  }

  function run() {
    let count = 10;
    const loop = setInterval(() => {
      if (count-- <= 0) {
        clearInterval(loop);
      }
      try {
        const player = window.videojs(
          document.getElementsByClassName("video-js")[0]
        );

        clearInterval(loop);

        function handlePlayState() {
          dispatch("state", {
            playing: !player.paused(),
            time: Math.floor(player.currentTime() * 1000)
          });
        }

        player.on("play", handlePlayState);
        player.on("pause", handlePlayState);
        player.on("seeking", handlePlayState);
        player.on("seeked", handlePlayState);
        player.on("ended", handlePlayState);

        const subtitles = player.options_.textTracks.map(track => {
          return getTTMLSubtitle(track.src)
            .then(parseTTMLCues)
            .then(cues => {
              return {
                language: track.language,
                cues
              };
            });
        });

        Promise.all(subtitles).then(subtitles => {
          dispatch("info", {
            title: "HBO Nordic"
          });
          dispatch("subtitles", subtitles);
        });
      } catch (error) {
        console.log(error);
      }
    }, 1000);
  }

  window.addEventListener("pushstate", run);
  const originalPush = history.pushState;
  history.pushState = function(...args) {
    originalPush.bind(this)(...args);
    window.dispatchEvent(new Event("pushstate"));
  };

  run();
})();
