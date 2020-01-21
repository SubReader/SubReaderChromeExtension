import React from "react";
import styled from "styled-components";
import Spinner from "./Spinner";


const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(5px);
`;

export default function LoadingIndicator() {
  return (
    <LoadingContainer>
      <Spinner />
    </LoadingContainer>
  );
}
