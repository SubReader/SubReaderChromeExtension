import React from "react";
import { useFormState } from "react-use-form-state";
import { useMutation } from "@apollo/react-hooks";
import { GraphQLError } from "graphql";
import { useIntl } from "react-intl";

import { IAuthResult } from "../../../types";
import { LoadingIndicator } from "../../LoadingIndicator";
import { TextInput } from "../../TextInput";
import { SubmitInput } from "../../SubmitInput";
import { AUTHENTICATE_WITH_CODE } from "../queries";


interface ICodeLoginProps {
  onLogin: (data: IAuthResult) => void;
}

export const CodeLogin: React.FC<ICodeLoginProps> = ({ onLogin }) => {
  const [formState, { text: textField }] = useFormState();
  const { formatMessage } = useIntl();

  const valid = formState.validity.code;

  const [authentificateFn, authentificateRes] = useMutation(AUTHENTICATE_WITH_CODE, {
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
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (valid) {
          const { code: loginCode } = formState.values;
          textField("code").onChange({ target: { value: "" } });
          authentificateFn({
            variables: {
              loginCode,
            },
          });
        }
      }}
    >
      <TextInput {...textField("code")} placeholder={formatMessage({ id: "form.placeholder.code" })} />
      <SubmitInput type="submit" value={formatMessage({ id: "form.button.login" })} />
    </form>
  );
};
