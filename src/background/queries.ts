import gql from "graphql-tag";


export const REFRESH_ACCESS_TOKEN = gql`
  mutation RefreshAccessToken($refreshToken: String!) {
    refreshAccessToken(refreshToken: $refreshToken) {
      accessToken {
        value
        expiresIn
      }
    }
  }
`;

export const CREATE_USER_STREAM = gql`
  mutation CreateUserStream($stream: UserStreamInput, $service: String!) {
    createUserStream(stream: $stream, service: $service) {
      stream {
        id
      }
      streamToken {
        value
      }
      supportedServices
    }
  }
`;
