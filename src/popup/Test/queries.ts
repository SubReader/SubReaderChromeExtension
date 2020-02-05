import gql from "graphql-tag";


export const CREATE_REEPAY_RECURRING_SESSION_FOR_COUNTRY = gql`
  mutation CreateReepayRecurringSessionForCountry(
    $country: CountryCode!
    $acceptURL: String
    $cancelURL: String
    $buttonText: String
  ) {
    createReepayRecurringSession(
      country: $country
      acceptURL: $acceptURL
      cancelURL: $cancelURL
      buttonText: $buttonText
    ) {
      id
      url
    }
  }
`;
