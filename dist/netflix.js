"use strict"

const supportedLanguages = ["da", "en", "de", "fr"]

function toArray(NodeList) {
  return Array.prototype.slice.call(NodeList)
}

function validLanguage(lang) {
  return supportedLanguages.includes(lang)
}

function getFirstQuery(query) {
  return toArray(document.querySelectorAll(query))
    .slice(0, 1)
}

function getVideo() {
  return getFirstQuery("video")
}
function getTimedTextEl() {
  return getFirstQuery(".player-timedtext")
}
function getLanguageEl() {
  return getFirstQuery(".player-timed-text-tracks > .player-track-selected")
}
function getLanguage() {
  return getLanguageEl()
    .map(el => el.dataset.id.split(";")[2])
    .filter(validLanguage)
}

// Maybe a -> (a -> Maybe b) -> Maybe b
function andThen(maybeA, fn) {
  return maybeA
    .map(fn)
    .filter(x => x.length)
    .map(x => x[0])
}

function handleFind(info) {
  let previousText = ""
  info.video.addEventListener("timeupdate", () => {
    const text = info.timedTextEl.innerText
    getLanguage()
      .forEach(language => {
        if(text !== previousText && text !== "") {
          console.log(text, language)
        }
        previousText = text
      })
  })
}

let running = true
function initialize() {
  const findLoop = setInterval(() => {
    andThen(getVideo(), video => {
      return andThen(getTimedTextEl(), timedTextEl => {
        return [{ video, timedTextEl }]
      })
    })
    .forEach(info => {
      handleFind(info)
      clearInterval(findLoop)
      running = false
    })
  }, 200)
}

initialize()
window.onpopstate = () => {
  if(!running) {
    initialize()
  }
}
