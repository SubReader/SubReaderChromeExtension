import * as React from "react";
import styled from "styled-components";
import { useApolloClient, useQuery } from "react-apollo";
// eslint-disable-next-line import/default
import QRCodeComponent from "qrcode.react";
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
  const client = useApolloClient();
  const { data, loading, error } = useQuery(REQUEST_ACCESS);

  React.useEffect(() => {
    if (!loading && data) {
      client
        .mutate({
          mutation: POLL_ACCESS,
          variables: {
            authToken: data.requestAccess.authToken.value,
          },
        })
        .then(({ data }) => {
          onLogin(data.pollAccess);
        });
    }
  }, [data, loading]);

  return (
    <QRCodeWrapper>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          <QRCodeTitle>Scan QR koden med SubReader appen.</QRCodeTitle>
          <QRCode size={120} value={`subreader://authenticate?id=${data.requestAccess.authCode}`} />
        </>
      )}
    </QRCodeWrapper>
  );
};
