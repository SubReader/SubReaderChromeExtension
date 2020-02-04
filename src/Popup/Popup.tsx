import * as React from "react";
import styled from "styled-components";

import { PopupContent } from "./PopupContent";
import { LogoSvg } from "./LogoSvg";


const PopupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 250px;
`;

const PopupContainer = styled.div`
  display: flex;
  flex: 1;
`;

const LogoContainer = styled.div`
  margin-top: 20px;
`;

const Logo = styled(LogoSvg)`
  display: block;
  width: 140px;
  margin: 0 auto;
`;

export const Popup: React.FC = () => {
  return (
    <PopupWrapper>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <PopupContainer>
        <PopupContent />
      </PopupContainer>
    </PopupWrapper>
  );
};
