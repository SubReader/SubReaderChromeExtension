import React, { useState } from "react";
import gql from "graphql-tag";
import client from "./client";
import { Mutation, Query } from "react-apollo";
import { useFormState } from "react-use-form-state";
import QRCode from "qrcode.react";

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

const AUTHENTICATE = gql`
  mutation Authenticate($email: String!, $password: String!) {
    authenticate(email: $email, password: $password) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

const REQUEST_ACCESS = gql`
  query RequestAccess {
    requestAccess {
      authCode
      authToken {
        value
        expiresIn
      }
    }
  }
`;

const POLL_ACCESS = gql`
  mutation PollAccess($authToken: String!) {
    pollAccess(authToken: $authToken) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

export default function Login({ onLogin }) {
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);
  const [
    formState,
    { email: emailField, password: passwordField }
  ] = useFormState();
  const valid = formState.validity["email"] && formState.validity["password"];

  return (
    <div>
      {usePasswordLogin ? (
        <Mutation
          mutation={AUTHENTICATE}
          onCompleted={({ authenticate }) => {
            onLogin(authenticate);
          }}
        >
          {(authenticate, { loading, error }) => (
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
                <div>Loading</div>
              ) : error ? (
                <ul>
                  {error.graphQLErrors.map(error => (
                    <li>{error.message}</li>
                  ))}
                </ul>
              ) : null}
              <input {...emailField("email")} placeholder="Email" />
              <input {...passwordField("password")} placeholder="Adgangskode" />
              <input disabled={!valid} type="submit" value="Log ind" />
            </form>
          )}
        </Mutation>
      ) : (
        <Query
          query={REQUEST_ACCESS}
          fetchPolicy="network-only"
          onCompleted={async ({ requestAccess }) => {
            const { data } = await client.mutate({
              mutation: POLL_ACCESS,
              variables: {
                authToken: requestAccess.authToken.value
              }
            });
            const { pollAccess } = data;
            onLogin(pollAccess);
          }}
        >
          {({ data: { requestAccess }, loading, error }) =>
            loading ? (
              <div>Loading</div>
            ) : error ? (
              <div>Error: {error.message}</div>
            ) : (
              <QRCode
                value={`subreader://authenticate?id=${requestAccess.authCode}`}
              />
            )
          }
        </Query>
      )}
      <button onClick={() => setUsePasswordLogin(!usePasswordLogin)}>
        Toggle login
      </button>
    </div>
  );
}
