import React from "react";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import { useFormState } from "react-use-form-state";
import gql from "graphql-tag";

import LoadingIndicator from "./LoadingIndicator";
import TextInput from "./TextInput";
import SubmitInput from "./SubmitInput";


const CodeLoginContainer = styled.div``;

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
  mutation Authenticate($loginCode: String!) {
    authResult: authenticateWithLoginCode(loginCode: $loginCode) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

export default function PasswordLogin({ onLogin }) {
  const [formState, { text: textField }] = useFormState();
  const valid = formState.validity.code;

  return (
    <Mutation
      mutation={AUTHENTICATE}
      onCompleted={({ authResult }) => {
        onLogin(authResult);
      }}
    >
      {(authenticate, { loading, error }) => (
        <>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (valid) {
                const { code } = formState.values;
                textField("code").onChange({ target: { value: "" } });
                authenticate({
                  variables: {
                    loginCode: code,
                  },
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
            <TextInput {...textField("code")} placeholder="Log ind kode" />
            <SubmitInput type="submit" value="Log ind" />
          </form>
        </>
      )}
    </Mutation>
  );
}
