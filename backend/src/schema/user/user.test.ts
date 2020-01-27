import { createTestClient } from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server-micro";

import test from "ava";

import * as allTypes from "../../schema";
import { makeSchema } from "nexus";

const schema = makeSchema({ types: allTypes });

const server = new ApolloServer({ schema });
const { query, mutate } = createTestClient(server);

import { before, after } from "../testutils";

test.before(before);

test.serial("creates user", async t => {
  const CREATEUSER = gql`
    mutation signup($username: String!, $password: String!) {
      signup(username: $username, password: $password)
    }
  `;

  const result = await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(",
      password: ".sdasdad*&^^%$Jmandb   sdas"
    }
  });

  console.log(result);

  t.pass();
});

test.serial("doesn't create user (short username)", async t => {
  t.pass();
});

test.serial("doesn't create user (duplicate username)", async t => {
  t.pass();
});

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

test.after.always(after);
