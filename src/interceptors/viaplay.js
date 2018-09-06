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

function parseQueryString(queryString) {
  return queryString
    .split("&")
    .map(part => part.split("="))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

function check(url) {
  const [path, guid] = (url || window.location.pathname).split("/").slice(1);
  if (path === "player" && guid) {
    console.log("[SubReader] Viaplay detected");
    const mediaLink =
      `https://play.viaplay.dk/api/stream/byguid?` +
      [
        `deviceId=${localStorage.getItem("deviceId")}`,
        `deviceName=web`,
        `deviceType=pc`,
        `userAgent=SubReader`,
        `deviceKey=pc-dash`,
        `guid=${guid}`
      ].join("&");

    fetchJSON(mediaLink, true).then(mediaInfo => {
      Promise.all(
        mediaInfo._links["viaplay:sami"].map(subtitle => {
          return fetch(subtitle.href, false).then(sami => {
            return {
              sami,
              language: subtitle.languageCode
            };
          });
        })
      ).then(samiSubtitles => {
        window.dispatchEvent(
          new CustomEvent("sami-subtitles", { detail: samiSubtitles })
        );
        window.dispatchEvent(
          new CustomEvent("info", {
            detail: {
              title: "Viaplay"
            }
          })
        );
      });
      /*
      fetchJSON(mediaInfo._links["viaplay:product"].href, true).then(info => {
        try {
          const { content } = info["_embedded"]["viaplay:product"];
          const title = content.title;
          const coverUri = content.images.boxart.url;
          const backdropUri = content.images.landscape.url;
          window.dispatchEvent(
            new CustomEvent("info", {
              detail: {
                title,
                cover: { uri: coverUri },
                backdrop: { uri: backdropUri }
              }
            })
          );
        } catch (e) {
          window.dispatchEvent(
            new CustomEvent("info", {
              detail: {
                title: "Viaplay"
              }
            })
          );
        }
      });
      */
    });
  }
}

function intercept(rawFunc, interceptor) {
  return function() {
    interceptor.apply(this, arguments);
    return rawFunc.apply(this, arguments);
  };
}

history.pushState = intercept(history.pushState, (a, b, url) => {
  check(url);
});

history.popState = intercept(history.popState, () => {
  check();
});

check();
