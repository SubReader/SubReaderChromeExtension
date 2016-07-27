import { Observable } from "rx"
import { emit, on$, on } from "./communication"
import { escapeHTML, toArray, Maybe, find } from "./utils"

const supportedLanguages = ["da", "en", "de", "fr", "sv", "no"]

function getLanguage() {
  return find(".player-timed-text-tracks > .player-track-selected")
    .then(el => el.dataset.id.split(";")[2])
}

function getTitle() {
  return find(".player-status-main-title")
    .then(el => el.innerText)
}

function getStatus() {
  return find(".player-status")
}

function search() {
  return find("video")
    .then(video => ({ video }))
    .combine(
      find(".player-timedtext"),
      (acc, timedTextEl) => ({...acc, timedTextEl }))
}

function getInfo() {
  return getTitle().then(title => ({
    name: "Netflix",
    icon: { uri: null },
    movie: {
      title,
      episode: null,
      season: null,
      cover: {
        uri: "http://static1.squarespace.com/static/550a10cbe4b03c7ec206488b/55165997e4b0617803522a94/55165997e4b0617803522aa1/1427529847895/iphone-6-plus-wallpaper-deep-red-facets.jpg?format=500w"
      }
    }
  }))
}

const search$ = on$(["search"])

const info$ = search$
  .flatMap(() => {
    return Observable.create(observer => {
      function sendInfo() {
        getInfo().then(info => observer.onNext(info))
      }
      const loop = setInterval(sendInfo, 2000)
      return () => clearInterval(loop)
    })
  })


const meta$ = search$
  .flatMap(() => {
    return Observable.create(observer => {
      search().then(result => observer.onNext(result))
    })
  })

const cues$ = meta$
  .map(({ video, timedTextEl }) => {
    return Observable.create(observer => {
      let previousText = ""
      function updateHandler() {
        const innerText = timedTextEl.innerText
        const text = escapeHTML(innerText)
        if(innerText !== previousText && text !== "") {
          getLanguage().then(language => {
            observer.onNext([{
              text,
              language,
              time: Date.now()
            }])
          })
        }
        previousText = innerText
      }
      video.addEventListener("timeupdate", updateHandler)
      return () => video.removeEventListener("timeupdate", updateHandler)
    })
  })
  .switch()

emit(cues$, "cues")
emit(info$, "info")
