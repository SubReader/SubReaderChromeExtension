import gql from "graphql-tag";


export const AUTHENTICATION_FRAGMENT = gql`
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

export const REQUEST_ACCESS = gql`
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

export const POLL_ACCESS = gql`
  mutation PollAccess($authToken: String!) {
    pollAccess(authToken: $authToken) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

export const AUTHENTICATE_WITH_CODE = gql`
  mutation Authenticate($loginCode: String!) {
    authResult: authenticateWithLoginCode(loginCode: $loginCode) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

export const AUTHENTICATE_WITH_EMAIL = gql`
  mutation Authenticate($email: String!, $password: String!) {
    authenticate(email: $email, password: $password) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

export const AUTHENTICATE_WITH_MVIDSIGON_MUTATION = gql`
  mutation AuthenticateWithMVIDSignOn($sessionID: String!) {
    authenticateWithMVIDSignOn(sessionID: $sessionID) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;

export const REGISTER_WITH_MVIDSIGON_MUTATION = gql`
  mutation RegisterWithMVIDSignOn($sessionID: String!) {
    registerWithMVIDSignOn(sessionID: $sessionID) {
      ...AuthenticationFragment
    }
  }
  ${AUTHENTICATION_FRAGMENT}
`;
