(function() {
  const LANGUAGE_MAP = {
    svenska: "sv"
  };

  function sendInfo(info) {
    window.dispatchEvent(new CustomEvent("info", { detail: info }));
  }

  function sendSubtitles(subtitles) {}

  if (window.jwplayer) {
    const player = window.jwplayer();
    const { tracks, title } = player.getConfig();

    console.log(tracks);
    sendInfo({ title });

    const vttTracks = tracks
      .filter(track => {
        return (
          track.label &&
          Object.keys(LANGUAGE_MAP).includes(track.label.toLowerCase())
        );
      })
      .map(track => {
        const language = LANGUAGE_MAP[track.label.toLowerCase()];
        return {
          language,
          url: track.file
        };
      });

    window.dispatchEvent(new CustomEvent("vtt-tracks", { detail: vttTracks }));
  }
})();
