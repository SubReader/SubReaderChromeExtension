import styled from "styled-components";


const TextInput = styled.input`
  display: block;
  border: none;
  border-bottom: 1px solid #aaa;
  padding: 5px 0px;
  outline: none;
  font-size: 16px;

  &:active {
    border-bottom-color: black;
  }
`;

export default TextInput;
