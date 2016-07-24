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
        uri: null
      }
    }
  }))
}

const search$ = on$(["search"])

const info$ = search$
  .flatMap(() => {
    return Observable.create(observer => {
      getInfo().then(info => observer.onNext(info))
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
