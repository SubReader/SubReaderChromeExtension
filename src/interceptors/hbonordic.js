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
  const [hours, minutes, seconds, rest] = timestamp
    .split(":")
    .map(x => parseInt(x));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + rest * 10;
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

function parseQueryString(queryString) {
  return queryString
    .split("&")
    .map(part => part.split("="))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

class HBOInterceptor {
  constructor() {
    this.playing = false;
    this.time = 0;
    this.foundAt = null;
    this.playLoop = null;
    this.player = null;
  }

  intercept(name, interceptor) {
    let original;
    Object.defineProperty(window, name, {
      set(val) {
        original = val;
      },
      get() {
        return function() {
          interceptor.apply(this, arguments);
          return original.apply(this, arguments);
        };
      }
    });
  }

  fetchSubtitles() {
    const flashvars = parseQueryString(this.player.children.flashvars.value);
    Promise.all(
      JSON.parse(flashvars.subTitles).map(sub => {
        return getTTMLSubtitle(sub.url).then(xml => {
          const cues = parseTTMLCues(xml);
          return {
            cues,
            language: sub.code.slice(0, 2)
          };
        });
      })
    ).then(subtitles => {
      this.dispatch("subtitles", subtitles);
    });
  }

  findTime(cb) {
    const player = this.player;
    let lastPosition = player.getPosition();
    requestAnimationFrame(function step() {
      const pos = player.getPosition();
      if (pos !== lastPosition) {
        cb(pos * 1000);
      } else {
        requestAnimationFrame(step);
      }
    });
  }

  dispatch(event, obj) {
    window.dispatchEvent(
      new CustomEvent(event, {
        detail: obj
      })
    );
  }

  play() {
    if (this.playing) return;
    this.findTime(foundTime => {
      this.playing = true;
      this.time = foundTime;
      this.foundAt = Date.now();
      this.dispatch("state", {
        time: this.time,
        playing: this.playing
      });

      this.playLoop = setInterval(() => {
        this.dispatch("state", {
          time: this.time + Date.now() - this.foundAt,
          playing: this.playing
        });
      }, 2000);
    });
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    clearInterval(this.playLoop);
    this.dispatch("state", {
      time: this.time + Date.now() - this.foundAt,
      playing: this.playing
    });
  }

  start() {
    const self = this;
    this.intercept("playerEvent", event => {
      if (event.type === "PLAYBACK") {
        if (event.subtype === "START") {
          self.play();
        }

        if (event.subtype === "PAUSE") {
          self.pause();
        }
      }
    });

    this.intercept("playerBridgeCreated", (playerId, event) => {
      switch (event) {
        case "onJavaScriptBridgeCreated": {
          self.player = document.getElementById(playerId);
          self.fetchSubtitles();
        }
      }
    });
  }
}

new HBOInterceptor().start();
