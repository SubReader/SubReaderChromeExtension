import React, { useState, useEffect } from "react";
import styled from "styled-components";
import QRCode from "qrcode.react";

const Container = styled.div`
  min-width: 200px;
  padding: 1em;
`;

import Login from "./login";

export default function Popup() {
  const [loading, setLoading] = useState(false);
  const [streams, setStreams] = useState([]);
  const [user, setUser] = useState();
  const [currentTabId, setCurrentTabId] = useState();

  useEffect(() => {
    // @ts-ignore
    chrome.storage.sync.get("user", ({ user }) => {
      if (user) {
        setUser(JSON.parse(user));
      }
    });

    // @ts-ignore
    chrome.runtime.sendMessage(
      {
        action: "getStreams"
      },
      ({ streams }) => {
        setStreams(streams);
      }
    );

    // @ts-ignore
    chrome.tabs.getSelected(null, tab => {
      setCurrentTabId(tab.id);
    });
  }, []);

  function handleLogin({ accessToken, refreshToken, user }) {
    setLoading(true);
    // @ts-ignore
    chrome.storage.sync.set(
      {
        user: JSON.stringify(user),
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
        expirationDate: new Date(
          Date.now() + accessToken.expiresIn * 1000
        ).toISOString()
      },
      () => {
        setUser(user);
        setLoading(false);
      }
    );
  }

  function handleLogout() {
    setLoading(true);
    // @ts-ignore
    chrome.storage.sync.remove(
      ["user", "accessToken", "refreshToken", "expirationDate"],
      () => {
        setUser(null);
        setLoading(false);
      }
    );
  }

  const stream = streams.find(stream => stream.id == currentTabId);

  return (
    <Container>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <h1>Velkommen {user.name}</h1>
          {stream ? (
            <h2>Showing {stream.id}</h2>
          ) : (
            <ul>
              {streams.map((stream, i) => (
                <li key={i}>{JSON.stringify(stream)}</li>
              ))}
            </ul>
          )}
          <button onClick={handleLogout}>Log ud</button>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </Container>
  );
}
