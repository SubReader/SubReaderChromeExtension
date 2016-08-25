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
    icon: { uri: null },
    movie: {
      title: "Finding Nemo",
      episode: null,
      season: null,
      cover: {
        uri: "https://s-media-cache-ak0.pinimg.com/236x/2d/8e/33/2d8e33d5b5063d7a0dcd9b1f3456017b.jpg"
      }
    }
  })))
  .switch()

const meta$ = search$.flatMap(search)

const cues$ = meta$
  .map(({ video }) => {
    return Observable.create(observer => {
      const textTracks = toArray(video.textTracks)
        .filter(track => supportedLanguages.includes(track.language))

      textTracks.forEach(track => {
        track.oncuechange = function(e) {
          toArray(track.activeCues)
            .forEach(cue => {
              observer.onNext([{
                text: cue.text,
                language: track.language,
                time: Date.now()
              }])
            })
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

const time$ = Observable.interval(5000).map(_ => Date.now())


emit(time$, "time")
emit(info$, "info")
emit(cues$, "cues")
