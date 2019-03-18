(function() {
  function fetch(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function() {
        resolve(this.response);
      };
      xhr.onerror = () => reject();
      xhr.send();
    });
  }

  function parseTime(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(parseFloat);
    return (((hours * 60 + minutes) * 60 + seconds) * 1000) | 0;
  }

  function json2cues(json) {
    return json.Entries.map(entry => {
      return {
        timeIn: parseTime(entry.Time),
        timeOut: parseTime(entry.Time) + parseTime(entry.Duration),
        text: entry.Line1 + (entry.Line2 ? "\n " + entry.Line2 : "")
      };
    });
  }
  function sendInfo(info) {
    window.dispatchEvent(new CustomEvent("info", { detail: info }));
  }

  function sendSubtitles(subtitles) {
    window.dispatchEvent(new CustomEvent("subtitles", { detail: subtitles }));
  }

  const GoBrain = window["GoBrain"];
  if (GoBrain) {
    const { data } = GoBrain.widgets().player.embedSettings;
    fetch(data)
      .then(text => {
        return JSON.parse(text);
      })
      .then(data => {
        const { asset, metadata } = data;

        sendInfo({
          title: metadata.description
        });

        const subtitles = asset.resources
          .filter(res => res.type == "subtitle")
          .map(subtitle => {
            const links = [].concat.apply(
              [],
              subtitle.renditions.map(r => r.links)
            );
            const vttLinks = links.filter(l => l.mimeType == "text/vtt");
            const jsonLinks = links.filter(
              l => l.mimeType == "application/json"
            );

            const language =
              subtitle.language || subtitle.renditions[0].language;

            if (jsonLinks.length > 0) {
              // Use json links
              console.log(subtitle);
              return fetch(jsonLinks[0].href.replace("http://", "//"))
                .then(text => JSON.parse(text))
                .then(data => {
                  return {
                    language,
                    cues: json2cues(data)
                  };
                });
            } else {
              // Use vtt links
              return Promise.resolve();
            }
          });

        return Promise.all(subtitles);
      })
      .then(subtitles => {
        sendSubtitles(subtitles);
      });
  }
})();
