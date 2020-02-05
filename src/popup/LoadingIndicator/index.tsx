import * as React from "react";

import { Spinner } from "./Spinner";
import { LoadingContainer } from "./styles";


export const LoadingIndicator: React.FC = () => {
  return (
    <LoadingContainer>
      <Spinner />
    </LoadingContainer>
  );
};
