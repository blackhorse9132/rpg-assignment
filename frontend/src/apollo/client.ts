import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpUri = import.meta.env.VITE_GRAPHQL_HTTP ?? 'http://localhost:3200/graphql';
const wsUri = import.meta.env.VITE_GRAPHQL_WS ?? 'ws://localhost:3200/graphql';

const httpLink = new HttpLink({ uri: httpUri });

const authLink = setContext((_, previousContext) => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      ...previousContext.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    connectionParams: () => {
      const token = localStorage.getItem('auth_token');
      return token ? { authorization: `Bearer ${token}` } : {};
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
