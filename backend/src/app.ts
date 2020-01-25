import { ApolloServer, gql } from "apollo-server";

import * as allTypes from "./schema";
import { makeSchema } from "nexus";
import path from "path";

const schema = makeSchema({
  types: allTypes,
  outputs: {
    schema: path.join(__dirname, "./generated/schema.graphql"),
    typegen: path.join(__dirname, "./generated/my-generated-types.d.ts")
  }
});

const server = new ApolloServer({ schema });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
