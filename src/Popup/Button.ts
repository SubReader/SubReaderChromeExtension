import styled from "styled-components";


export const Button = styled.button`
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
