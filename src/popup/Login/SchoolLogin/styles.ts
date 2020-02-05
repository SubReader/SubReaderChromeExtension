import styled from "styled-components";


export const SchoolLoginButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: opacity linear 200ms;
  cursor: pointer;
  border: 1px solid #ddd;
  padding: 5px;

  &:hover {
    border-color: #aaa;
  }
`;
