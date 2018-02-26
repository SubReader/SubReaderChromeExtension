function fetch(url, withCredentials) {
  const xhr = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhr.open("GET", url);
    xhr.withCredentials = withCredentials;
    xhr.onload = function() {
      resolve(this.response);
    };
    xhr.send();
  });
}

function fetchJSON(url, withCredentials) {
  return fetch(url, withCredentials).then(data => JSON.parse(data));
}

function check() {
  if (viaplay && viaplay.streamUrl) {
    console.log("[SubReader] Viaplay detected");
    const mediaLink = viaplay.linkParser.expandApiLink(viaplay.streamUrl, {
      deviceId: "SubReader",
      deviceKey: "pcdash-dk",
      deviceName: "SubReader",
      deviceType: "SubReader",
      userAgent: "SubReader"
    });
    fetchJSON(mediaLink, true)
      .then(mediaInfo => {
        return Promise.all(
          mediaInfo._links["viaplay:sami"].map(subtitle => {
            return fetch(subtitle.href, false).then(sami => {
              return {
                sami,
                language: subtitle.languageCode
              };
            });
          })
        );
      })
      .then(samiSubtitles => {
        window.dispatchEvent(
          new CustomEvent("sami-subtitles", { detail: samiSubtitles })
        );
      });
  }
}

function intercept(rawFunc, interceptor) {
  return function() {
    interceptor.apply(this, arguments);
    return rawFunc.apply(this, arguments);
  };
}

history.pushState = intercept(history.pushState, () => {
  check();
});

history.popState = intercept(history.popState, () => {
  check();
});

check();
