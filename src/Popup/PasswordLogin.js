import React from "react";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import { useFormState } from "react-use-form-state";
import gql from "graphql-tag";

import LoadingIndicator from "./LoadingIndicator";

const PasswordLoginContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const InputGroup = styled.div``;

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

const SubmitInput = styled.input`
  display: block;
  width: 100%;
  margin: 5px auto;
  border: none;
  outline: none;
  background-color: black;
  color: white;
  padding: 8px;
  text-transform: uppercase;
  font-weight: 800;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
`;

const AUTHENTICATION_FRAGMENT = gql`
  fragment AuthenticationFragment on AuthenticationResult {
    accessToken {
      value
      expiresIn
    }
    refreshToken {
      value
    }
    user {
      name
    }
  }
`;

export const AUTHENTICATE = gql`
  mutation Authenticate($email: String!, $password: String!) {
    authenticate(email: $email, password: $password) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

export default function PasswordLogin({ onLogin }) {
  const [
    formState,
    { email: emailField, password: passwordField }
  ] = useFormState();
  const valid = formState.validity["email"] && formState.validity["password"];

  return (
    <Mutation
      mutation={AUTHENTICATE}
      onCompleted={({ authenticate }) => {
        onLogin(authenticate);
      }}
    >
      {(authenticate, { loading, error }) => (
        <PasswordLoginContainer>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (valid) {
                const { email, password } = formState.values;
                passwordField("password").onChange({ target: { value: "" } });
                authenticate({
                  variables: {
                    email,
                    password
                  }
                });
              }
            }}
          >
            {loading ? (
              <LoadingIndicator />
            ) : error ? (
              <ul>
                {error.graphQLErrors.map(error => (
                  <li>{error.message}</li>
                ))}
              </ul>
            ) : null}
            <InputGroup>
              <TextInput {...emailField("email")} placeholder="Email" />
              <TextInput
                {...passwordField("password")}
                placeholder="Adgangskode"
              />
            </InputGroup>
            <SubmitInput type="submit" value="Log ind" />
          </form>
        </PasswordLoginContainer>
      )}
    </Mutation>
  );
}
