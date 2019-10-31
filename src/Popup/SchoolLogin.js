import React from "react";
import styled from "styled-components";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

const SchoolLoginButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: opacity linear 200ms;
  cursor: pointer;
  border: 1px solid #ddd;
  padding: 5px;

  &:hover {
    border-color: #aaa;
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

const REGISTER_WITH_MVIDSIGON_MUTATION = gql`
  mutation RegisterWithMVIDSignOn($sessionID: String!) {
    registerWithMVIDSignOn(sessionID: $sessionID) {
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

  const [registerWithMVIDSignOn] = useMutation(
    REGISTER_WITH_MVIDSIGON_MUTATION
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

            try {
              const res = await registerWithMVIDSignOn({
                variables: {
                  sessionID: SessionID
                }
              });
              onLogin(res.data.registerWithMVIDSignOn);
            } catch (registrationError) {
              try {
                const res = await authenticateWithMVIDSignOn({
                  variables: {
                    sessionID: SessionID
                  }
                });
                onLogin(res.data.authenticateWithMVIDSignOn);
              } catch (authenticationError) {
                console.error(registrationError);
                console.error(authenticationError);
              }
            }
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
