import * as React from "react";
import styled from "styled-components";
import { useMutation } from "@apollo/react-hooks";
import { AUTHENTICATE_WITH_MVIDSIGON_MUTATION, REGISTER_WITH_MVIDSIGON_MUTATION } from "./queries";


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

function parseQueryParams(url: string): any {
  const [, queryParams] = url.split("?");
  return queryParams.split("&").reduce((acc: object, kvPair: string) => {
    const [k, v] = kvPair.split("=");
    return Object.assign({}, acc, {
      [k]: v,
    });
  }, {});
}

interface ISchoolLoginProps {
  onLogin: (data: any) => void;
}

export const SchoolLogin: React.FC<ISchoolLoginProps> = ({ onLogin }) => {
  const [authenticateWithMVIDSignOn] = useMutation(AUTHENTICATE_WITH_MVIDSIGON_MUTATION);

  const [registerWithMVIDSignOn] = useMutation(REGISTER_WITH_MVIDSIGON_MUTATION);

  return (
    <SchoolLoginButton
      onClick={() => {
        chrome.identity.launchWebAuthFlow(
          {
            url: `https://signon.vitec-mv.com/?returnUrl=${chrome.identity.getRedirectURL()}`,

            interactive: true,
          },
          async (returnURL: string) => {
            const { SessionID }: { SessionID: string } = parseQueryParams(returnURL);

            try {
              const res = await registerWithMVIDSignOn({
                variables: {
                  sessionID: SessionID,
                },
              });
              onLogin(res.data.registerWithMVIDSignOn);
            } catch (registrationError) {
              try {
                const res = await authenticateWithMVIDSignOn({
                  variables: {
                    sessionID: SessionID,
                  },
                });
                onLogin(res.data.authenticateWithMVIDSignOn);
              } catch (authenticationError) {
                console.error(registrationError);
                console.error(authenticationError);
              }
            }
          },
        );
      }}
    >
      <img style={{ width: "32px", height: "auto", marginRight: "5px" }} src="graduation-hat.svg" alt="" />
      <span>For lærere</span>
    </SchoolLoginButton>
  );
};
