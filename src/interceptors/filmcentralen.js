(function() {
  function fetch(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function() {
        resolve(this.response);
      };
      xhr.send();
    });
  }

  try {
    const videoPosterEl = document.getElementsByClassName("video-poster")[0];
    // @ts-ignore
    const id = videoPosterEl.dataset.href.split("/")[0];
    // @ts-ignore
    const title = videoPosterEl.dataset.title;

    // @ts-ignore
    const subtitles = Drupal.settings.fc_subtitles.map(({ code }) => {
      const language = code.toLowerCase();
      return fetch(
        `https://filmcentralen.dk/subtitles/${language}/${id}.vtt`
      ).then(vtt => ({
        language,
        vtt
      }));
    });

    Promise.all(subtitles).then(subtitles => {
      window.dispatchEvent(
        new CustomEvent("vtt-subtitles", { detail: subtitles })
      );
    });

    window.dispatchEvent(
      new CustomEvent("info", {
        detail: {
          title
        }
      })
    );
  } catch (error) {
    console.error(error);
  }
})();
