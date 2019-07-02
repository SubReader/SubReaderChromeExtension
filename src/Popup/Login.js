import React, { useState } from "react";
import styled from "styled-components";
import QRCodeLogin from "./QRCodeLogin";
import PasswordLogin from "./PasswordLogin";
import CodeLogin from "./CodeLogin";
import Button from "./Button";

const LoginWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const LoginContainer = styled.div`
  display: flex;
  flex: 1;
  padding: 10px 20px;
`;

const LoginTypeToggleButton = styled(Button)``;

export default function Login({ onLogin }) {
  const [loginType, setLoginType] = useState("qr-code");

  return (
    <LoginWrapper>
      <LoginContainer>
        {loginType == "password" ? (
          <PasswordLogin onLogin={onLogin} />
        ) : loginType == "qr-code" ? (
          <QRCodeLogin onLogin={onLogin} />
        ) : loginType == "code" ? (
          <CodeLogin onLogin={onLogin} />
        ) : null}
      </LoginContainer>
      <LoginTypeToggleButton
        onClick={() => {
          setLoginType(loginType == "code" ? "qr-code" : "code");
        }}
      >
        {loginType == "password" ? "Log ind med QR kode" : "Log ind med kode"}
      </LoginTypeToggleButton>
    </LoginWrapper>
  );
}
