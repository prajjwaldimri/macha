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
let authorizedApolloClient2: ApolloServerTestClient;
let authorizedApolloClient3: ApolloServerTestClient;

import { before, after } from "../testutils";
import { UserModel } from "../../models/User";
import { OneTimeCodeModel } from "../../models/OneTimeCode";

test.before(async () => {
  await before();
  const CREATEUSER = gql`
    mutation signup($username: String!, $password: String!, $name: String!) {
      signup(username: $username, password: $password, name: $name)
    }
  `;
  await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(",
      password: ".sdasdad*&^^%$Jmandb   sdas",
      name: "Test User"
    }
  });

  await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(--2",
      password: ".sdasdad*&^^%$Jmandb   sdas",
      name: "Test User 2"
    }
  });

  await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(--3",
      password: ".sdasdad*&^^%$Jmandb   sdas",
      name: "Test User 3"
    }
  });

  const user = await UserModel.findOne({ username: "test@#!use*(" }).select(
    "-password"
  );

  const user2 = await UserModel.findOne({ username: "test@#!use*(--2" }).select(
    "-password"
  );

  const user3 = await UserModel.findOne({ username: "test@#!use*(--3" }).select(
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

  authorizedApolloClient2 = createTestClient(
    new ApolloServer({
      schema,
      context: () => {
        return {
          user: user2
        };
      }
    })
  );

  authorizedApolloClient3 = createTestClient(
    new ApolloServer({
      schema,
      context: () => {
        return {
          user: user3
        };
      }
    })
  );
});

//#region Generate Macha OTC
const GENERATEMACHAOTC = gql`
  mutation generateMachaOTC($userCount: Int!) {
    generateMachaOTC(userCount: $userCount)
  }
`;

let createdOTC: string;

test.serial("should generate OTC", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: GENERATEMACHAOTC,
    variables: {
      userCount: 1
    }
  });

  t.assert(result.data);
  createdOTC = result.data!.generateMachaOTC;
  t.assert(!result.errors);
  const otc = await OneTimeCodeModel.findById(result.data!.generateMachaOTC);
  t.assert(otc);
});

test.serial("shouldn't generate OTC (not logged in)", async t => {
  const result = await mutate({
    mutation: GENERATEMACHAOTC,
    variables: {
      userCount: 1
    }
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("shouldn't generate OTC (wrong user count)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: GENERATEMACHAOTC,
    variables: {
      userCount: -100
    }
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

//#endregion

//#region Add Macha

const ADDMACHA = gql`
  mutation addMacha($oneTimeCode: String!) {
    addMacha(oneTimeCode: $oneTimeCode) {
      username
    }
  }
`;

test.serial("should add a macha", async t => {
  const result = await authorizedApolloClient2.mutate({
    mutation: ADDMACHA,
    variables: {
      oneTimeCode: createdOTC
    }
  });

  console.log(result);

  t.assert(result.data);
  t.assert(!result.errors);
});

test.serial("shouldn't add a macha (not logged in)", async t => {
  const result = await mutate({
    mutation: ADDMACHA,
    variables: {
      oneTimeCode: createdOTC
    }
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("shouldn't add a macha (wrong one time code)", async t => {
  const result = await authorizedApolloClient2.mutate({
    mutation: ADDMACHA,
    variables: {
      oneTimeCode: "786136751287316798213"
    }
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("shouldn't add a macha (expired one time code)", async t => {
  const result = await authorizedApolloClient3.mutate({
    mutation: ADDMACHA,
    variables: {
      oneTimeCode: createdOTC
    }
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

//#endregion

//#region Remove Macha

//#endregion

test.after.always(after);
