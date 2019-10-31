import React, { useState } from "react";
import styled from "styled-components";
import QRCodeLogin from "./QRCodeLogin";
import PasswordLogin from "./PasswordLogin";
import CodeLogin from "./CodeLogin";
import Button from "./Button";
import SchoolLogin from "./SchoolLogin";

const LoginWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoginContainer = styled.div`
  padding: 10px 20px;
`;

const LoginTypeToggleButton = styled.button`
  appearance: none;
  -webkit-apperance: none;
  -moz-appearance: none;
  background-color: none;
  border: none;
  opacity: 0.6;
  outline: none;
  transition: opacity 200ms;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const LoginTypeButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-ttems: center;
`;

export default function Login({ onLogin }) {
  const [showAlternativeLogin, setShowAlternativeLogin] = useState(false);
  const [showSchoolLogin, setShowSchoolLogin] = useState(false);

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
            onClick={() => {
              setShowAlternativeLogin(!showAlternativeLogin);
            }}
          >
            {showAlternativeLogin ? "Log ind med QR" : "Log ind med kode"}
          </LoginTypeToggleButton>
        </LoginTypeButtonContainer>
      </LoginContainer>
    </LoginWrapper>
  );
}
