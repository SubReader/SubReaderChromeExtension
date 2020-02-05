import styled from "styled-components";
import { LogoSvg } from "../icons/LogoSvg";


export const PopupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 250px;
`;

export const PopupContainer = styled.div`
  display: flex;
  flex: 1;
`;

export const LogoContainer = styled.div`
  margin-top: 20px;
`;

export const Logo = styled(LogoSvg)`
  display: block;
  width: 140px;
  margin: 0 auto;
`;
