(function() {
  const LANGUAGE_MAP = {
    svenska: "sv",
  };

  function sendInfo(info) {
    window.dispatchEvent(new CustomEvent("info", { detail: info }));
  }

  if (window.jwplayer) {
    const player = window.jwplayer();
    const { captionsList, title } = player.getConfig();

    sendInfo({ title });

    const vttTracks = captionsList
      .filter(track => {
        return track.label && Object.keys(LANGUAGE_MAP).includes(track.label.toLowerCase());
      })
      .map(track => {
        const language = LANGUAGE_MAP[track.label.toLowerCase()];
        return {
          language,
          url: track.file,
        };
      });

    window.dispatchEvent(new CustomEvent("vtt-tracks", { detail: vttTracks }));
  }
})();
