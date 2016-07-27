import React, { Component } from "react"
import ReactDOM from "react-dom"
import fetch from "isomorphic-fetch"
import { Observable } from "rx"
import ConnectView from "./ConnectView"
import { server } from "../config"
import { emit } from "../communication"

export default class Popup extends Component {

  constructor(props) {
    super(props)
    this.state = { id: null, token: null }
  }

  componentDidMount() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      tabs.forEach(({ id }) => {
        chrome.tabs.sendMessage(id, {
          action: "search"
        }, () => {})
      })
    })

    const idPromise = fetch(`${server}/streams/create`)
      .then(res => res.json())
      .then(json => json.data)
      .then(json => json._id)

    const id$ = Observable.fromPromise(idPromise)
    emit(id$, "id")

    id$.subscribe(id => this.setState({ id }))

  }

  render() {
    const { id } = this.state
    return (
      <div>
        <h1>SubReader</h1>
        {id && <ConnectView id={id} />}
      </div>
    )
  }
}

ReactDOM.render(<Popup/>, document.getElementById("app"))