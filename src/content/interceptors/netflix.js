(function() {
  function intercept(rawFunc, interceptor) {
    return function() {
      interceptor.apply(this, arguments);
      return rawFunc.apply(this, arguments);
    };
  }

  function getLanguage() {
    return "da";
  }

  function parseTTML(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const cues = Array.prototype.slice.call(doc.getElementsByTagName("p")).map(el => {
      const textEl = document.createElement("div");
      textEl.innerHTML = el.innerHTML;
      return {
        timeIn: Math.floor(parseInt(el.attributes.begin.value) / 10000),
        timeOut: Math.floor(parseInt(el.attributes.end.value) / 10000),
        text: textEl.innerText,
      };
    });
    const subtitle = {
      language: getLanguage(),
      cues,
    };
    return subtitle;
  }

  function sendSubtitles(subtitles) {
    window.dispatchEvent(new CustomEvent("subtitles", { detail: subtitles }));
  }

  function sendInfo(info) {
    window.dispatchEvent(new CustomEvent("info", { detail: info }));
  }

  function handleSubtitle(rawSubtitle, type) {
    const subtitle = type === "ttml" ? parseTTML(rawSubtitle) : rawSubtitle;
    sendSubtitles([subtitle, { ...subtitle, language: "sv" }, { ...subtitle, language: "no" }]);
  }

  function sendTitle() {
    const title = document.querySelector(".video-title");
    sendInfo({
      // @ts-ignore
      title: title ? title.innerText.trim() : "Netflix",
    });
  }

  XMLHttpRequest.prototype.open = intercept(XMLHttpRequest.prototype.open, function(method, url) {
    if (url.indexOf("nflxvideo.net/?o") !== -1) {
      this.addEventListener("load", () => {
        handleSubtitle(this.response, "ttml");
        sendTitle();
      });
    }
  });
})();
