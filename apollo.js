const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer, gql }  = require('apollo-server-express');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { myGraphQLSchema } = require('./my-schema');

const PORT = 3000;
const app = express();

app.use('/graphql', bodyParser.json());

const apolloServer = new ApolloServer({ schema: myGraphQLSchema });
apolloServer.applyMiddleware({ app });

const pubsub = new PubSub();
const server = createServer(app);

server.listen(PORT, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema: myGraphQLSchema,
    }, {
      server: server,
      path: '/subscriptions',
    });
});
