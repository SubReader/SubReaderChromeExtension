import * as React from "react";
// eslint-disable-next-line import/default
import QRCode from "qrcode.react";

import { IStreamEntry } from "../../types";
import { LoadingIndicator } from "../LoadingIndicator";
import { STATUS } from "../../types/enums";
import { IntroContainer, QRContainer, QRWrapper, Title, VideoGuide } from "./styles";


interface IEntryProps {
  entry: IStreamEntry | undefined;
}

export const Entry: React.FC<IEntryProps> = props => {
  const { entry } = props;

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
      <iframe width={400} height={300} src="https://app.subreader.dk/subreader-home" />
    );
  }

  return null;
};