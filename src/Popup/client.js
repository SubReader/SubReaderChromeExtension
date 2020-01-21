import ApolloClient from "apollo-boost";


const client = new ApolloClient({
  uri: "https://api.subreader.dk",
});

export default client;
