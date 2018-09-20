function intercept(rawFunc, interceptor) {
  return function() {
    interceptor.apply(this, arguments);
    return rawFunc.apply(this, arguments);
  };
}

function fetch(url, withCredentials = true) {
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

function sendInfo(info) {
  window.dispatchEvent(
    new CustomEvent("info", {
      detail: info
    })
  );
}

function sendSamiSubtitles(samiSubtitles) {
  window.dispatchEvent(
    new CustomEvent("sami-subtitles", { detail: samiSubtitles })
  );
}

function handleIntercept(info) {
  const { content, _links } = info._embedded["viaplay:product"];
  sendInfo({
    title: content.title,
    cover: {
      uri: content.images.boxart.url
    },
    backdrop: {
      uri: content.images.landscape.url
    }
  });

  fetchJSON(
    window.viaplay.linkParser.expandApiLink(_links["viaplay:stream"].href, {
      deviceId: localStorage.getItem("deviceId"),
      deviceName: "web",
      deviceKey: "pc-dash",
      deviceType: "pc",
      userAgent: "SubReader",
      availabilityContext: null,
      hls_fmp4: null
    })
  ).then(stream => {
    Promise.all(
      stream._links["viaplay:sami"].map(subtitle => {
        return fetch(subtitle.href, false).then(sami => {
          return {
            sami,
            language: subtitle.languageCode
          };
        });
      })
    ).then(sendSamiSubtitles);
  });
}

XMLHttpRequest.prototype.open = intercept(
  XMLHttpRequest.prototype.open,
  function(method, url) {
    if (url.includes("content.viaplay.dk/pcdash-dk")) {
      this.addEventListener("load", function handler() {
        handleIntercept(JSON.parse(this.response));
        this.removeEventListener("load", handler);
      });
    }
  }
);
