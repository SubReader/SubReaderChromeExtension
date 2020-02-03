import * as React from "react";
import styled from "styled-components";
// eslint-disable-next-line import/default
import QRCode from "qrcode.react";
import { Login } from "./Login";
import { Button } from "./Button";

import { LogoSvg } from "./LogoSvg";
import { LoadingIndicator } from "./LoadingIndicator";

import { IStream } from "../types";


const PopupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 250px;
`;

const PopupContainer = styled.div`
  display: flex;
  flex: 1;
`;

const LogoContainer = styled.div`
  margin-top: 20px;
`;

const Logo = styled(LogoSvg)`
  display: block;
  width: 140px;
  margin: 0 auto;
`;

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 10px;
`;

const QRWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const QRContainer = styled.div`
  padding: 10px;
`;

const IntroContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  text-align: center;
`;
const SubTitle = styled.h3`
  text-align: center;
`;

const VideoGuide = styled.video`
  width: 100%;
  margin: 0 auto;
  min-width: 420px;
`;

export const Popup: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [streams, setStreams] = React.useState<Array<IStream>>([]);
  const [user, setUser] = React.useState();
  const [currentTabId, setCurrentTabId] = React.useState();
  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    // @ts-ignore
    chrome.storage.sync.get("user", ({ user }) => {
      if (user) {
        setUser(JSON.parse(user));
      }
    });

    // @ts-ignore
    chrome.runtime.sendMessage({ action: "getStreams" }, ({ streams }) => {
      setStreams(streams);
    });

    // @ts-ignore
    chrome.tabs.getSelected(null, tab => {
      setCurrentTabId(tab.id);
    });
  }, []);

  function handleLogin({ accessToken, refreshToken, user }: { accessToken: any; refreshToken: any; user: any }): void {
    setLoading(true);
    // @ts-ignore
    chrome.storage.sync.set(
      {
        user: JSON.stringify(user),
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
        expirationDate: new Date(Date.now() + accessToken.expiresIn * 1000).toISOString(),
      },
      () => {
        setUser(user);
        setLoading(false);
      },
    );
  }

  function handleLogout(): void {
    setLoading(true);
    // @ts-ignore
    chrome.storage.sync.remove(["user", "accessToken", "refreshToken", "expirationDate"], () => {
      setUser(null);
      setLoading(false);
    });
  }

  function toggleShowError(): void {
    setShowError(!showError);
  }

  const statusSortingOrder = ["resolved", "pending", "rejected", "closed"];
  const entry: any = streams
    .sort((a, b) => {
      return (
        statusSortingOrder.findIndex(status => status === a.status)
        - statusSortingOrder.findIndex(status => status === b.status)
      );
    })
    .find(stream => stream.id === currentTabId);

  return (
    <PopupWrapper>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <PopupContainer>
        {loading ? (
          <LoadingIndicator />
        ) : user ? (
          <MainWrapper>
            {entry ? (
              entry.status === "pending" ? (
                <LoadingIndicator />
              ) : entry.status === "resolved" ? (
                <QRWrapper>
                  <Title>Scan QR koden med SubReader appen</Title>
                  <QRContainer>
                    <QRCode size={180} level="L" value={`subreader://${entry.stream.id}`} />
                  </QRContainer>
                </QRWrapper>
              ) : entry.status === "rejected" ? (
                <div>
                  <Title>Kunne ikke åbne stream.</Title>
                  <button onClick={toggleShowError}>{showError ? "Skjul" : "Vis"} fejl</button>
                  {showError && (
                    <div>
                      <SubTitle>{entry.error.message}</SubTitle>
                      <pre>{JSON.stringify(entry.error, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ) : null
            ) : (
              <IntroContainer>
                <Title>Åben en streaming tjeneste for at bruge SubReader</Title>
                <VideoGuide src="video1.mp4" autoPlay={true} controls={true} loop={true} />
              </IntroContainer>
            )}
            <Button onClick={handleLogout}>Log ud</Button>
          </MainWrapper>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </PopupContainer>
    </PopupWrapper>
  );
};
