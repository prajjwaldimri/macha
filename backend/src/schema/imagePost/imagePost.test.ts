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
import { ImagePostModel } from "../../models/ImagePost";

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
});

//#region Create Image Post

const CREATEIMAGEPOST = gql`
  mutation createImagePost(
    $uri: String!
    $image: String!
    $caption: String
    $location: String
  ) {
    createImagePost(
      uri: $uri
      image: $image
      caption: $caption
      location: $location
    ) {
      uri
      image
      caption
    }
  }
`;

test.serial("should create image post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      image: "base/64 encoded image value",
      caption: "Living life",
      location: "15.401100, 74.011803"
    }
  });

  const post = await ImagePostModel.findOne({ uri: "test-uri" });

  t.assert(post);
  t.assert(!result.errors);
  t.assert(result.data);
  t.assert(post!.caption === "Living life");
});

test.serial("should not create image post (same-uri)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      image: "base/64 encoded image value",
      caption: "Living life",
      location: "15.401100, 74.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("should not create image post (no image)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      image: "",
      caption: "Living life",
      location: "15.401100, 74.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("should not create image post (wrong location)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      image: "base/64 encoded image value",
      caption: "Living life",
      location: "1523948328947, 1293812937"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test("shouldn't create image post (not logged in)", async t => {
  const result = await mutate({
    mutation: CREATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      image: "base/64 encoded image value",
      caption: "Living life",
      location: "15.401100, 74.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

//#endregion

test.after.always(after);
