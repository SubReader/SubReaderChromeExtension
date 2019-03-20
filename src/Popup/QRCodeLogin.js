import React from "react";
import client from "./client";
import styled from "styled-components";
import { Query } from "react-apollo";
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
  return (
    <QRCodeWrapper>
      <Query
        query={REQUEST_ACCESS}
        fetchPolicy="network-only"
        onCompleted={async ({ requestAccess }) => {
          const { data } = await client.mutate({
            mutation: POLL_ACCESS,
            variables: {
              authToken: requestAccess.authToken.value
            }
          });
          const { pollAccess } = data;
          onLogin(pollAccess);
        }}
      >
        {({ data: { requestAccess }, loading, error }) =>
          loading ? (
            <LoadingIndicator />
          ) : error ? (
            <div>Error: {error.message}</div>
          ) : (
            <>
              <QRCodeTitle>Scan QR koden med SubReader appen.</QRCodeTitle>
              <QRCode
                size={120}
                value={`subreader://authenticate?id=${requestAccess.authCode}`}
              />
            </>
          )
        }
      </Query>
    </QRCodeWrapper>
  );
}
