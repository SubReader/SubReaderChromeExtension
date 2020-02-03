import * as React from "react";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import { useFormState } from "react-use-form-state";

import { LoadingIndicator } from "./LoadingIndicator";
import { SubmitInput } from "./SubmitInput";
import { TextInput } from "./TextInput";
import { AUTHENTICATE_WITH_EMAIL } from "./queries";
import { GraphQLError } from "graphql";
import { ApolloError } from "apollo-client";


const PasswordLoginContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const InputGroup = styled.div``;

interface IPasswordLoginProps {
  onLogin: (data: any) => void;
}

export const PasswordLogin: React.FC<IPasswordLoginProps> = ({ onLogin }) => {
  const [formState, { email: emailField, password: passwordField }] = useFormState();
  const valid = formState.validity.email && formState.validity.password;

  return (
    <Mutation
      mutation={AUTHENTICATE_WITH_EMAIL}
      onCompleted={({ authenticate }: { authenticate: any }): void => {
        onLogin(authenticate);
      }}
    >
      {(authenticate: any, { loading, error }: { loading: boolean; error?: ApolloError }): React.ReactElement => (
        <PasswordLoginContainer>
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
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
                {error.graphQLErrors.map(
                  (error: GraphQLError, i: number): React.ReactElement => (
                    <li key={i}>{error.message}</li>
                  ),
                )}
              </ul>
            ) : null}
            <InputGroup>
              <TextInput {...emailField("email")} placeholder="Email" />
              <TextInput {...passwordField("password")} placeholder="Adgangskode" />
            </InputGroup>
            <SubmitInput type="submit" value="Log ind" />
          </form>
        </PasswordLoginContainer>
      )}
    </Mutation>
  );
};
