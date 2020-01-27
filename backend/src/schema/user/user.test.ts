import dotenv from "dotenv";
dotenv.config();

import { createTestClient } from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server-micro";

import * as allTypes from "../../schema";
import { makeSchema } from "nexus";

const schema = makeSchema({ types: allTypes });

const server = new ApolloServer({ schema });
const { query, mutate } = createTestClient(server);

import test from "ava";

test("Test Test", async t => {
  const QUERY = gql`
    query {
      user
    }
  `;

  const result = await query({ query: QUERY });
  t.deepEqual("From inside", result.data!.user);
  console.log(result);
});
