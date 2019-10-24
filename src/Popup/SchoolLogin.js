import React from "react";
import styled from "styled-components";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

const SchoolLoginButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  transition: opacity linear 200ms;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

function parseQueryParams(url) {
  const [_, queryParams] = url.split("?");
  const params = queryParams.split("&").reduce((acc, kvPair) => {
    const [k, v] = kvPair.split("=");
    return Object.assign({}, acc, {
      [k]: v
    });
  }, {});

  return params;
}

const AUTHENTICATE_WITH_MVIDSIGON_MUTATION = gql`
  mutation AuthenticateWithMVIDSignOn($sessionID: String!) {
    authenticateWithMVIDSignOn(sessionID: $sessionID) {
      user {
        name
      }
      accessToken {
        value
        expiresIn
      }
      refreshToken {
        value
      }
    }
  }
`;

export default function SchoolLogin({ onLogin }) {
  const [authenticateWithMVIDSignOn] = useMutation(
    AUTHENTICATE_WITH_MVIDSIGON_MUTATION
  );

  return (
    <SchoolLoginButton
      onClick={() => {
        chrome.identity.launchWebAuthFlow(
          {
            url: `https://signon.vitec-mv.com/?returnUrl=${chrome.identity.getRedirectURL()}`,

            interactive: true
          },
          async returnURL => {
            const { SessionID } = parseQueryParams(returnURL);
            const res = await authenticateWithMVIDSignOn({
              variables: {
                sessionID: SessionID
              }
            });
            onLogin(res.data.authenticateWithMVIDSignOn);
          }
        );
      }}
    >
      <img
        style={{ width: "32px", height: "auto", marginRight: "5px" }}
        src="graduation-hat.svg"
      />
      <span>For lærere</span>
    </SchoolLoginButton>
  );
}
