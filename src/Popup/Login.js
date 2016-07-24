import React, { Component } from "react"

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: "",
      password: ""
    }
  }

  render() {
    const { username, password } = this.state
    const { onSubmit } = this.props
    return (
      <div>
        <h1 className="title">SubReader</h1>
        <input
          value={username}
          onChange={e => this.setState({ username: e.target.value })}
          type="text"
          placeholder="email"
        />
        <input
          value={password} 
          onChange={e => this.setState({ password: e.target.value })}
          placeholder="adgangskode"
          type="password"
        />
        <input
          type="submit"
          className="primary"
          onClick={() => onSubmit({ username, password })}
          value="Log ind"
        />
      </div>
    )
  }
}
