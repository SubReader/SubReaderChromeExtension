import * as React from "react";
import { Mutation } from "react-apollo";
import { useFormState } from "react-use-form-state";

import { LoadingIndicator } from "./LoadingIndicator";
import { TextInput } from "./TextInput";
import { SubmitInput } from "./SubmitInput";
import { AUTHENTICATE_WITH_CODE } from "./queries";
import { GraphQLError } from "graphql";
import { ApolloError } from "apollo-client";


interface ICodeLoginProps {
  onLogin: (data: any) => void;
}

export const CodeLogin: React.FC<ICodeLoginProps> = ({ onLogin }) => {
  const [formState, { text: textField }] = useFormState();
  const valid = formState.validity.code;

  return (
    <Mutation
      mutation={AUTHENTICATE_WITH_CODE}
      onCompleted={({ authResult }: { authResult: any }): void => {
        onLogin(authResult);
      }}
    >
      {(authenticate: any, { loading, error }: { loading: boolean; error?: ApolloError }): React.ReactElement => (
        <>
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
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
                {error.graphQLErrors.map(
                  (error: GraphQLError, i: number): React.ReactElement => (
                    <li key={i}>{error.message}</li>
                  ),
                )}
              </ul>
            ) : null}
            <TextInput {...textField("code")} placeholder="Log ind kode" />
            <SubmitInput type="submit" value="Log ind" />
          </form>
        </>
      )}
    </Mutation>
  );
};
