import { Observable } from "rx"
import { emit, on$, on } from "./communication"
import { escapeHTML, toArray, Maybe, find } from "./utils"
import { supportedLanguages } from "./config"

const search$ = on$(["search"])

function search() {
  return find("video")
    .then(video => ({ video }))
}

const info$ = search$
  .map(() => Observable.interval(2000).map(() => ({
    name: "Chrome Video",
    movie: {
      title: "Finding Nemo",
      cover: {
        uri: "https://s-media-cache-ak0.pinimg.com/236x/2d/8e/33/2d8e33d5b5063d7a0dcd9b1f3456017b.jpg"
      }
    }
  })))
  .switch()

const meta$ = search$.flatMap(search)

const subtitles$ = meta$
  .map(({ video }) => {
    return Observable.create(observer => {
      const textTracks = toArray(video.textTracks)
        .filter(track => supportedLanguages.includes(track.language))

      textTracks.forEach(track => {
        track.oncuechange = () => {
          observer.onNext([{
            language: track.language,
            cues: toArray(track.activeCues).map(cue => ({
              text: cue.text,
              timeIn: Date.now(),
              timeOut: Date.now() + ((cue.endTime - cue.startTime) * 1000),
              id: cue.id
            }))
          }])
        }
      })

      return function dispose() {
        textTracks.forEach(track => {
          track.oncuechange = null
        })
      }

    })
  })
  .switch()


const state$ = Observable.interval(2000).map(() => ({
  time: Date.now(),
  playing: true,
  done: false
}))

emit(state$, "state")
emit(info$, "info")
emit(subtitles$, "subtitles")
