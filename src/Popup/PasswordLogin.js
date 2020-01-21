import React from "react";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import { useFormState } from "react-use-form-state";
import gql from "graphql-tag";

import LoadingIndicator from "./LoadingIndicator";
import SubmitInput from "./SubmitInput";
import TextInput from "./TextInput";


const PasswordLoginContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const InputGroup = styled.div``;

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
    { email: emailField, password: passwordField },
  ] = useFormState();
  const valid = formState.validity.email && formState.validity.password;

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
                    password,
                  },
                });
              }
            }}
          >
            {loading ? (
              <LoadingIndicator />
            ) : error ? (
              <ul>
                {error.graphQLErrors.map((error, i) => (
                  <li key={i}>{error.message}</li>
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
