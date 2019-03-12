import React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { useFormState } from "react-use-form-state";

const AUTHENTICATE = gql`
  mutation Authenticate($email: String!, $password: String!) {
    authenticate(email: $email, password: $password) {
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
  }
`;

export default function Login({ onLogin }) {
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
  );
}
