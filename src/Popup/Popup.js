import React, { useState, useEffect } from "react";
import styled from "styled-components";
import QRCode from "qrcode.react";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 200px;
  min-height: 200px;
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

  const entry = streams.find(stream => stream.id == currentTabId);

  return (
    <Container>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          {entry ? (
            entry.status == "resolved" ? (
              <div>
                <QRCode
                  size={180}
                  level="L"
                  value={`subreader://${entry.stream.id}`}
                />
              </div>
            ) : null
          ) : (
            <div>
              {streams.length > 0 ? (
                streams.map((entry, i) => (
                  <li key={i}>{JSON.stringify(entry)}</li>
                ))
              ) : (
                <h1>Åben en side for at bruge SubReader</h1>
              )}
            </div>
          )}
          <button onClick={handleLogout}>Log ud</button>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </Container>
  );
}
