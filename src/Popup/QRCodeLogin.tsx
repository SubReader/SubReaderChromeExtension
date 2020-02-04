import * as React from "react";
import styled from "styled-components";
import { useMutation, useQuery } from "react-apollo";
// eslint-disable-next-line import/default
import QRCodeComponent from "qrcode.react";

import { IAuthResult } from "../types";
import { LoadingIndicator } from "./LoadingIndicator";
import { POLL_ACCESS, REQUEST_ACCESS } from "./queries";


const QRCode = styled(QRCodeComponent)`
  display: block;
  margin: 0 auto;
`;

const QRCodeWrapper = styled.div`
  min-width: 200px;
`;

const QRCodeTitle = styled.h3`
  text-align: center;
`;

interface IQRCodeLoginProps {
  onLogin: (data: any) => void;
}

export const QRCodeLogin: React.FC<IQRCodeLoginProps> = ({ onLogin }) => {
  const requestedAccess = useQuery(REQUEST_ACCESS);
  const [pollAccessFn] = useMutation(POLL_ACCESS, {
    onCompleted: ({ authResult }: { authResult: IAuthResult }) => {
      onLogin(authResult);
    },
  });

  React.useEffect(() => {
    if (!requestedAccess.loading && requestedAccess.data) {
      pollAccessFn({
        variables: {
          authToken: requestedAccess.data.requestAccess.authToken.value,
        },
      });
    }
  }, [requestedAccess.data, requestedAccess.loading]);

  if (requestedAccess.loading) {
    return <LoadingIndicator />;
  }

  if (requestedAccess.error) {
    return <div>Error: {requestedAccess.error.message}</div>;
  }

  return (
    <QRCodeWrapper>
      <QRCodeTitle>Scan QR koden med SubReader appen.</QRCodeTitle>
      <QRCode size={120} value={`subreader://authenticate?id=${requestedAccess.data.requestAccess.authCode}`} />
    </QRCodeWrapper>
  );
};
