import * as React from "react";
import styled from "styled-components";
import { useFormState } from "react-use-form-state";
import { GraphQLError } from "graphql";
import { useMutation } from "@apollo/react-hooks";

import { IAuthResult } from "../types";
import { LoadingIndicator } from "./LoadingIndicator";
import { SubmitInput } from "./SubmitInput";
import { TextInput } from "./TextInput";
import { AUTHENTICATE_WITH_EMAIL } from "./queries";


const PasswordLoginContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const InputGroup = styled.div``;

interface IPasswordLoginProps {
  onLogin: (data: IAuthResult) => void;
}

export const PasswordLogin: React.FC<IPasswordLoginProps> = ({ onLogin }) => {
  const [formState, { email: emailField, password: passwordField }] = useFormState();
  const valid = formState.validity.email && formState.validity.password;

  const [authentificateFn, authentificateRes] = useMutation(AUTHENTICATE_WITH_EMAIL, {
    onCompleted: ({ authResult }: { authResult: IAuthResult }) => {
      onLogin(authResult);
    },
  });

  if (authentificateRes.loading) {
    return <LoadingIndicator />;
  }

  if (authentificateRes.error) {
    return (
      <ul>
        {authentificateRes.error.graphQLErrors.map(
          (error: GraphQLError, i: number): React.ReactElement => (
            <li key={i}>{error.message}</li>
          ),
        )}
      </ul>
    );
  }

  return (
    <PasswordLoginContainer>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
          e.preventDefault();
          if (valid) {
            const { email, password } = formState.values;
            passwordField("password").onChange({ target: { value: "" } });
            authentificateFn({
              variables: {
                email,
                password,
              },
            });
          }
        }}
      >
        <InputGroup>
          <TextInput {...emailField("email")} placeholder="Email" />
          <TextInput {...passwordField("password")} placeholder="Adgangskode" />
        </InputGroup>
        <SubmitInput type="submit" value="Log ind" />
      </form>
    </PasswordLoginContainer>
  );
};
