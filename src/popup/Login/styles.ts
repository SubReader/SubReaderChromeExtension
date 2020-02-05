import styled from "styled-components";


export const LoginWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const LoginContainer = styled.div`
  padding: 10px 20px;
`;

export const LoginTypeToggleButton = styled.button`
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

export const LoginTypeButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-ttems: center;
`;
