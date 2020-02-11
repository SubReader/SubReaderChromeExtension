import React from "react";

import { PopupContent } from "../PopupContent";
import { Logo, LogoContainer, PopupContainer, PopupWrapper } from "./styles";


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
