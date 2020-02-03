import {
  createTestClient,
  ApolloServerTestClient
} from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server-micro";

import test from "ava";

import * as allTypes from "../../schema";
import { makeSchema } from "nexus";

const schema = makeSchema({ types: allTypes });

const server = new ApolloServer({ schema });
const { query, mutate } = createTestClient(server);

let authorizedApolloClient: ApolloServerTestClient;

import { before, after } from "../testutils";
import { UserModel } from "../../models/User";

test.before(before);

//#region User Signup

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

  const user = await UserModel.findOne({ username: "test@#!use*(" }).select(
    "-password"
  );

  authorizedApolloClient = createTestClient(
    new ApolloServer({
      schema,
      context: () => {
        return {
          user: user
        };
      }
    })
  );

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

//#endregion

//#region User Login

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

//#endregion

//#region User Profile

const ME = gql`
  query {
    me {
      username
    }
  }
`;

test.serial("It should return the user", async t => {
  const result = await authorizedApolloClient.query({
    query: ME
  });

  t.assert(result.data!.me.username);
});

test.serial("It should not return the user (Not logged in)", async t => {
  const result = await query({
    query: ME
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.after.always(after);
