import { Observable } from "rx"
import io from "socket.io-client"
import { emit, on$ } from "./communication"
import { server } from "./config"
const socket = io(server)

const token$ = on$(["token"])
const subtitles$ = on$(["subtitles"])
const info$ = on$(["info"])
const state$ = on$(["state"])

subtitles$
  .combineLatest(token$, (subtitles, token) => ({ subtitles, token }))
  .subscribe(subtitlesObj => {
    console.log("subtitles", subtitlesObj)
    socket.emit("subtitles", subtitlesObj)
  })

info$
  .combineLatest(token$, (info, token) => ({ info, token }))
  .subscribe(infoObj => {
    console.log("info", infoObj)
    socket.emit("info", infoObj)
  })

state$
  .combineLatest(token$, (state, token) => ({ state, token }))
  .subscribe(stateObj => {
    console.log("state", stateObj)
    socket.emit("state", stateObj)
  })
