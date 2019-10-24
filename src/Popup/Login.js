import React, { useState } from "react";
import styled from "styled-components";
import QRCodeLogin from "./QRCodeLogin";
import PasswordLogin from "./PasswordLogin";
import CodeLogin from "./CodeLogin";
import Button from "./Button";
import SchoolLogin from "./SchoolLogin";

const LoginWrapper = styled.div``;

const LoginContainer = styled.div`
  padding: 10px 20px;
`;

const LoginTypeToggleButton = styled(Button)``;

export default function Login({ onLogin }) {
  const [showSchoolLogin, setShowSchoolLogin] = useState(false);

  return (
    <LoginWrapper>
      <LoginContainer>
        <QRCodeLogin onLogin={onLogin} />
        <div style={{ margin: "20px 0px" }} />
        <SchoolLogin onLogin={onLogin} />
      </LoginContainer>
    </LoginWrapper>
  );
}
