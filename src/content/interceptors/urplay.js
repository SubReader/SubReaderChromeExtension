(function() {
  const LANGUAGE_MAP = {
    svenska: "sv",
  };

  function sendInfo(info) {
    window.dispatchEvent(new CustomEvent("info", { detail: info }));
  }

  if (window.jwplayer) {
    const watchJwplayer = setInterval(() => {
      const player = window.jwplayer();
      try {
        const config = player.getConfig();
        const { captionsList } = config;
        const { title, image } = config.playlistItem;
        const info = {
          title,
          backdrop: { uri: image },
          cover: { uri: image },
        };
        sendInfo(info);
        clearInterval(watchJwplayer);
        sendVttTracks(captionsList);
      } catch (error) {}
    }, 50);

    function sendVttTracks(captionsList) {
      const vttTracks = captionsList
        .filter(track => {
          return track.label && Object.keys(LANGUAGE_MAP).includes(track.label.toLowerCase());
        })
        .map(track => {
          const language = LANGUAGE_MAP[track.label.toLowerCase()];
          return {
            language,
            url: track.id,
          };
        });

      window.dispatchEvent(new CustomEvent("vtt-tracks", { detail: vttTracks }));
    }
  }
})();
