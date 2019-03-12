const { Observable } = require("rxjs");
const fetch = require("isomorphic-fetch");
const {
  concatMap,
  withLatestFrom,
  distinct,
  retryWhen,
  delay,
  take
} = require("rxjs/operators");

const ApolloClient = require("apollo-boost").default;
const gql = require("graphql-tag").default;

const client = new ApolloClient({
  uri: "https://api.subreader.dk",
  fetch
});

function get$(name, transform) {
  return Observable.create(observer => {
    // @ts-ignore
    chrome.storage.sync.get(name, obj => {
      const value = obj[name];
      if (value) {
        observer.next(transform ? transform(value) : value);
      }
    });

    function handleChange(changes) {
      const value = changes[name];
      if (value && value.new) {
        observer.next(transform ? transform(value.new) : value.new);
      }
    }

    // @ts-ignore
    chrome.storage.onChanged.addListener(handleChange);

    return () => {
      // @ts-ignore
      chrome.storage.onChanged.removeListener(handleChange);
    };
  });
}

const accessToken$ = get$("accessToken");
const refreshToken$ = get$("refreshToken");
const expirationDate$ = get$("expirationDate", str => new Date(str));

const validAccessToken$ = accessToken$.pipe(
  withLatestFrom(expirationDate$, refreshToken$),
  concatMap(async ([accessToken, expirationDate, refreshToken]) => {
    if (expirationDate > new Date()) {
      return accessToken;
    } else {
      const { data } = await client.mutate({
        mutation: gql`
          mutation RefreshAccessToken($refreshToken: String!) {
            refreshAccessToken(refreshToken: $refreshToken) {
              accessToken {
                value
                expiresIn
              }
            }
          }
        `,
        variables: {
          refreshToken
        }
      });
      const {
        refreshAccessToken: { accessToken }
      } = data;

      // @ts-ignore
      chrome.storage.sync.set({
        accessToken: accessToken.value,
        expirationDate: new Date(
          Date.now() + accessToken.expiresIn
        ).toISOString()
      });

      return accessToken.value;
    }
  }),
  retryWhen(errors => {
    return errors.pipe(
      delay(1000),
      take(10)
    );
  }),
  distinct()
);

module.exports = {
  accessToken$,
  expirationDate$,
  refreshToken$,
  validAccessToken$
};
