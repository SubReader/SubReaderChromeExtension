import React, { useEffect } from "react";
import styled from "styled-components";
import { useApolloClient, useQuery } from "react-apollo";
import QRCodeComponent from "qrcode.react";
import gql from "graphql-tag";
import LoadingIndicator from "./LoadingIndicator";


const QRCode = styled(QRCodeComponent)`
  display: block;
  margin: 0 auto;
`;

const AUTHENTICATION_FRAGMENT = gql`
  fragment AuthenticationFragment on AuthenticationResult {
    accessToken {
      value
      expiresIn
    }
    refreshToken {
      value
    }
    user {
      name
    }
  }
`;

export const REQUEST_ACCESS = gql`
  query RequestAccess {
    requestAccess {
      authCode
      authToken {
        value
        expiresIn
      }
    }
  }
`;

export const POLL_ACCESS = gql`
  mutation PollAccess($authToken: String!) {
    pollAccess(authToken: $authToken) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

const QRCodeWrapper = styled.div`
  min-width: 200px;
`;

const QRCodeTitle = styled.h3`
  text-align: center;
`;

export default function QRCodeLogin({ onLogin }) {
  const client = useApolloClient();
  const { data, loading, error } = useQuery(REQUEST_ACCESS);

  useEffect(() => {
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
        <LoadingIndicator/>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          <QRCodeTitle>Scan QR koden med SubReader appen.</QRCodeTitle>
          <QRCode
            size={120}
            value={`subreader://authenticate?id=${data.requestAccess.authCode}`}
          />
        </>
      )}
    </QRCodeWrapper>
  );
}

/*
      <Query
        query={REQUEST_ACCESS}
        fetchPolicy="network-only"
        onCompleted={async ({ requestAccess }) => {
          const { data } = await client.mutate({
            mutation: ,
            variables: {
              authToken: requestAccess.authToken.value
            }
          });

        }}
      >
        {({ data: { requestAccess }, loading, error }) =>
        </Query>
*/
