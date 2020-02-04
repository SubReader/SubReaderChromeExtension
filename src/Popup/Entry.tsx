import * as React from "react";
import styled from "styled-components";
// eslint-disable-next-line import/default
import QRCode from "qrcode.react";

import { IStreamEntry } from "../types";
import { LoadingIndicator } from "./LoadingIndicator";
import { STATUS } from "../types/enums";


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

interface IEntryProps {
  entry: IStreamEntry | undefined;
}

export const Entry: React.FC<IEntryProps> = props => {
  const { entry } = props;
  const [showError, setShowError] = React.useState(false);

  function toggleShowError(): void {
    setShowError(!showError);
  }

  if (!entry) {
    return (
      <IntroContainer>
        <Title>Åben en streaming tjeneste for at bruge SubReader</Title>
        <VideoGuide src="video1.mp4" autoPlay={true} controls={true} loop={true} />
      </IntroContainer>
    );
  }

  if (entry.status === STATUS.PENDING) {
    return <LoadingIndicator />;
  }

  if (entry.status === STATUS.RESOLVED) {
    return (
      <QRWrapper>
        <Title>Scan QR koden med SubReader appen</Title>
        <QRContainer>
          <QRCode size={180} level="L" value={`subreader://${entry.stream!.id}`} />
        </QRContainer>
      </QRWrapper>
    );
  }

  if (entry.status === STATUS.REJECTED) {
    return (
      <div>
        <Title>Kunne ikke åbne stream.</Title>
        <button onClick={toggleShowError}>{showError ? "Skjul" : "Vis"} fejl</button>
        {showError && (
          <div>
            <SubTitle>{entry.error!.message}</SubTitle>
            <pre>{JSON.stringify(entry.error, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  return null;
};
