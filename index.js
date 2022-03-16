const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, execute, subscribe } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const { SubscriptionServer } = require('subscriptions-transport-ws');

// Create a server:
const app = express();

// Create a schema and a root resolver:
const schema = buildSchema(`
    type Book {
        title: String!
        author: String!
    }

    type Query {
        books: [Book]
    }

    type Subscription {
        newBooks: Book!
    }
`);

const pubsub = new PubSub();
const rootValue = {
    books: [
        {
            title: "The Name of the Wind",
            author: "Patrick Rothfuss",
        },
        {
            title: "The Wise Man's Fear",
            author: "Patrick Rothfuss",
        }
    ],
    newBooks: () => pubsub.asyncIterator("BOOKS_TOPIC")
};

// Use those to handle incoming requests:
app.use(graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}));

pubsub.publish("BOOKS_TOPIC", {
    title: 'The Stone of Door',
    author: 'Ross Pothfuss',
});

// Start the server:
const server = app.listen(8080, () => console.log("Server started on port 8080"));

// Handle incoming websocket subscriptions too:
SubscriptionServer.create({ schema, rootValue, execute, subscribe }, {
    server // Listens for 'upgrade' websocket events on the raw server
});

pubsub.publish("BOOKS_TOPIC", {
    title: 'The Sword in the Stone',
    author: 'Sir Reginold Patick',
});

setTimeout(() => {
    pubsub.publish("BOOKS_TOPIC", {
        title: 'The Doors of Stone',
        author: 'Patrick Rothfuss',
    });
    console.log(pubsub.asyncIterator("BOOKS_TOPIC"));
    for (thing in pubsub.asyncIterator("BOOKS_TOPIC")) {
        console.log(thing);
        pubsub.asyncIterator("BOOKS_TOPIC").next();
    }
    console.log(pubsub.asyncIterator("BOOKS_TOPIC"));
    const subs = pubsub.asyncIterator("BOOKS_TOPIC").pubsub.subscriptions
    for (thing in subs) {
        console.log(subs[thing]);
    }
}, 8000);
