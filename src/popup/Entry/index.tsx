import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";
// eslint-disable-next-line import/default
import QRCode from "qrcode.react";

import { IStreamEntry } from "../../types";
import { LoadingIndicator } from "../LoadingIndicator";
import { STATUS } from "../../types/enums";
import { IntroContainer, QRContainer, QRWrapper, Title, VideoGuide } from "./styles";
import { SubmitInput } from "../SubmitInput";


interface IEntryProps {
  entry: IStreamEntry | undefined;
}

export const Entry: React.FC<IEntryProps> = props => {
  const { entry } = props;

  const { formatMessage } = useIntl();

  if (!entry) {
    return (
      <IntroContainer>
        <Title>
          <FormattedMessage id="entry.absent" />
        </Title>
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
        <Title>
          <FormattedMessage id="entry.resolved" />
        </Title>
        <QRContainer>
          <QRCode size={180} level="L" value={`subreader://${entry.stream!.id}`} />
        </QRContainer>
      </QRWrapper>
    );
  }

  if (entry.status === STATUS.REJECTED) {
    return (
      <IntroContainer>
        <Title>
          <FormattedMessage id="entry.rejected" />
        </Title>
        <SubmitInput
          type="button"
          value={formatMessage({ id: "form.button.subscribe" })}
          onClick={(): void => {
            const url = "https://app.subreader.dk/subreader-home";
            chrome.tabs.create({ url });
          }}
        />
      </IntroContainer>
    );
  }

  return null;
};
