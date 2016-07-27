import { Observable } from "rx"
import io from "socket.io-client"
import { emit, on$ } from "./communication"
import { server } from "./config"
const socket = io(server)

const id$ = on$(["id"])
const cues$ = on$(["cues"])
const info$ = on$(["info"])

cues$
  .combineLatest(id$, (cues, id) => ({ cues, id }))
  .subscribe(cuesObj => {
    socket.emit("cues", cuesObj)
  })


info$
  .combineLatest(id$, (info, id) => ({ info, id }))
  .subscribe(infoObj => {
    socket.emit("info", infoObj)
  })