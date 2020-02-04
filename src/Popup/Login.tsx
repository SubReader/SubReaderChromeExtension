import * as React from "react";
import styled from "styled-components";

import { QRCodeLogin } from "./QRCodeLogin";
import { CodeLogin } from "./CodeLogin";
import { SchoolLogin } from "./SchoolLogin";
import { IAuthResult } from "../types";


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

interface ILoginProps {
  onLogin: (data: IAuthResult) => void;
}

export const Login: React.FC<ILoginProps> = ({ onLogin }) => {
  const [showAlternativeLogin, setShowAlternativeLogin] = React.useState(false);

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
            {showAlternativeLogin ? "Log ind med QR" : "Log ind med kode"}
          </LoginTypeToggleButton>
        </LoginTypeButtonContainer>
      </LoginContainer>
    </LoginWrapper>
  );
};
