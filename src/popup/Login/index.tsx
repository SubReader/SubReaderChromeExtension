import React, { useState } from "react";

import { QRCodeLogin } from "./QRCodeLogin";
import { CodeLogin } from "./CodeLogin";
import { SchoolLogin } from "./SchoolLogin";
import { IAuthResult } from "../../types";
import { LoginContainer, LoginTypeButtonContainer, LoginTypeToggleButton, LoginWrapper } from "./styles";
import { FormattedMessage } from "react-intl";

interface ILoginProps {
  onLogin: (data: IAuthResult) => void;
}

export const Login: React.FC<ILoginProps> = ({ onLogin }) => {
  const [showAlternativeLogin, setShowAlternativeLogin] = useState(false);

  return (
    <LoginWrapper>
      <LoginContainer>
        {showAlternativeLogin ? (
          <CodeLogin onLogin={onLogin} />
        ) : (
          <>
            <QRCodeLogin onLogin={onLogin} />
            <div style={{ margin: "20px" }} />
            <SchoolLogin onLogin={onLogin} />
          </>
        )}
        <LoginTypeButtonContainer>
          <LoginTypeToggleButton
            onClick={(): void => {
              setShowAlternativeLogin(!showAlternativeLogin);
            }}
          >
            {showAlternativeLogin ? <FormattedMessage id="login.main.qr" /> : <FormattedMessage id="login.main.code" />}
          </LoginTypeToggleButton>
        </LoginTypeButtonContainer>
      </LoginContainer>
    </LoginWrapper>
  );
};
