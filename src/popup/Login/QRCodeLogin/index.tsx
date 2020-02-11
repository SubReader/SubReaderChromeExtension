import React, { useEffect } from "react";
import { useMutation, useQuery } from "react-apollo";
import { FormattedMessage } from "react-intl";

import { IAuthResult } from "../../../types";
import { LoadingIndicator } from "../../LoadingIndicator";
import { POLL_ACCESS, REQUEST_ACCESS } from "../queries";
import { QRCode, QRCodeTitle, QRCodeWrapper } from "./styles";


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

  useEffect(() => {
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
      <QRCodeTitle>
        <FormattedMessage id="login.qr.title" />
      </QRCodeTitle>
      <QRCode size={120} value={`subreader://authenticate?id=${requestedAccess.data.requestAccess.authCode}`} />
    </QRCodeWrapper>
  );
};
