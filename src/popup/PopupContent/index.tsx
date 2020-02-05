import * as React from "react";

import { IAuthResult, IStreamEntry, IUser } from "../../types";
import { ACTION, STATUS } from "../../types/enums";
import { LoadingIndicator } from "../LoadingIndicator";
import { Login } from "../Login";
import { Entry } from "../Entry";
import { Button, MainWrapper } from "./styles";


export const PopupContent: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [streams, setStreams] = React.useState<Array<IStreamEntry>>([]);
  const [user, setUser] = React.useState<IUser | null>(null);
  const [currentTabId, setCurrentTabId] = React.useState();

  React.useEffect(() => {
    chrome.storage.sync.get("user", ({ user }: { user: string | null }) => {
      if (user) {
        setUser(JSON.parse(user));
      }
    });

    chrome.runtime.sendMessage({ action: ACTION.GET_STREAMS }, ({ streams }: { streams: Array<IStreamEntry> }) => {
      setStreams(streams);
    });

    chrome.tabs.getSelected(null, (tab: any) => {
      setCurrentTabId(tab.id);
    });
  }, []);

  function handleLogin({ accessToken, refreshToken, user }: IAuthResult): void {
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

  const statusSortingOrder = Object.values(STATUS);

  const entry = streams
    .sort((a, b) => {
      return (
        statusSortingOrder.findIndex(status => status === a.status)
        - statusSortingOrder.findIndex(status => status === b.status)
      );
    })
    .find(stream => stream.id === currentTabId);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <MainWrapper>
      <Entry entry={entry} />
      <Button onClick={handleLogout}>Log ud</Button>
    </MainWrapper>
  );
};
