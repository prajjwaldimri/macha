import { createTestClient } from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server-micro";

import test from "ava";

import * as allTypes from "../../schema";
import { makeSchema } from "nexus";

const schema = makeSchema({ types: allTypes });

const server = new ApolloServer({ schema });
const { query, mutate } = createTestClient(server);

import { before, after } from "../testutils";
import { UserModel } from "../../models/User";

test.before(before);

const CREATEUSER = gql`
  mutation signup($username: String!, $password: String!) {
    signup(username: $username, password: $password)
  }
`;

test.serial("creates user", async t => {
  const result = await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(",
      password: ".sdasdad*&^^%$Jmandb   sdas"
    }
  });

  const user = await UserModel.findOne({ username: "test@#!use*(" });

  t.assert(result.data!.signup);
  t.assert(user);
});

test.serial("doesn't create user (short username)", async t => {
  const result = await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "te",
      password: ".sdasdad*&^^%$Jmandb   sdas"
    }
  });

  const user = await UserModel.findOne({ username: "te" });

  t.assert(result.errors);
  t.assert(!user);
});

test.serial("doesn't create user (duplicate username)", async t => {
  const result = await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(",
      password: ".sdasdad*&^^%$Jmandb   sdas"
    }
  });
  const user = await UserModel.findOne({ username: "te" });

  t.assert(result.errors);
  t.assert(!user);
});

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;
test.serial("login successful", async t => {
  const result = await mutate({
    mutation: LOGIN,
    variables: {
      username: "test@#!use*(",
      password: ".sdasdad*&^^%$Jmandb   sdas"
    }
  });

  t.assert(result.data!.login);
});

test.serial("doesn't login(username is invalid)", async t => {
  const result = await mutate({
    mutation: LOGIN,
    variables: {
      username: "test@#!use(",
      password: ".sdasdad*&^^%$Jmandb   sdas"
    }
  });

  t.assert(result.errors);
});

test.serial("doesn't login(password is invalid)", async t => {
  const result = await mutate({
    mutation: LOGIN,
    variables: {
      username: "test@#!use*(",
      password: ".sdasdad*&^^%$Jmandb"
    }
  });

  t.assert(result.errors);
});
test.after.always(after);
