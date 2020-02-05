import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";


const link = new HttpLink({
  uri: "https://api.subreader.dk",
});

const cache = new InMemoryCache();

export default new ApolloClient({
  link,
  cache,
});
