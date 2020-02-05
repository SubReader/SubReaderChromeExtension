import * as React from "react";
import { useMutation } from "@apollo/react-hooks";

import { IAuthResult } from "../../../types";
import { AUTHENTICATE_WITH_MVIDSIGON_MUTATION, REGISTER_WITH_MVIDSIGON_MUTATION } from "../../queries";
import { SchoolLoginButton } from "./styles";


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
  onLogin: (data: IAuthResult) => void;
}

export const SchoolLogin: React.FC<ISchoolLoginProps> = ({ onLogin }) => {
  const [authenticateWithMVIDSignFn] = useMutation(AUTHENTICATE_WITH_MVIDSIGON_MUTATION);

  const [registerWithMVIDSignFn] = useMutation(REGISTER_WITH_MVIDSIGON_MUTATION);

  return (
    <SchoolLoginButton
      onClick={(): void => {
        chrome.identity.launchWebAuthFlow(
          {
            url: `https://signon.vitec-mv.com/?returnUrl=${chrome.identity.getRedirectURL()}`,
            interactive: true,
          },
          async (returnURL: string) => {
            const { SessionID: sessionID }: { SessionID: string } = parseQueryParams(returnURL);

            try {
              const res = await registerWithMVIDSignFn({
                variables: {
                  sessionID,
                },
              });
              onLogin(res.data.registerWithMVIDSignOn);
            } catch (registrationError) {
              try {
                const res = await authenticateWithMVIDSignFn({
                  variables: {
                    sessionID,
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
