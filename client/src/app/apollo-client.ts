import {ApolloClient, InMemoryCache} from '@apollo/client';
import {GRAPHQL_URI} from "@/app/constants";
import { HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link : new HttpLink({uri: GRAPHQL_URI}),
  cache: new InMemoryCache(),
});

export default client;
