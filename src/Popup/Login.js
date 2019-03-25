import React, { useState } from "react";
import styled from "styled-components";
import QRCodeLogin from "./QRCodeLogin";
import PasswordLogin from "./PasswordLogin";
import CodeLogin from "./CodeLogin";

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

const LoginTypeToggleButton = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  background-color: transparent;
  text-align: center;
  color: black;
  border: none;
  outline: none;
  opacity: 0.2;
  transition: opacity 200ms;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
`;

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
