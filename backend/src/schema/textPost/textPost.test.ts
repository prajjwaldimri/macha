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

import { before, after } from "../testutils";
import { UserModel } from "../../models/User";
import { TextPostModel } from "../../models/TextPost";

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

  const user = await UserModel.findOne({ username: "test@#!use*(" }).select(
    "-password"
  );

  const user2 = await UserModel.findOne({ username: "test@#!use*(--2" }).select(
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
});

//#region Create Text Post

const CREATETEXTPOST = gql`
  mutation createTextPost($uri: String!, $content: String!) {
    createTextPost(uri: $uri, content: $content) {
      uri
      content
    }
  }
`;

test.serial("should create text post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATETEXTPOST,
    variables: {
      uri: "test-uri",
      content: "Test Content"
    }
  });

  const post = await TextPostModel.findOne({ uri: "test-uri" });

  t.assert(post);
  t.assert(!result.errors);
  t.assert(result.data);
  t.assert(result.data!.createTextPost.content === "Test Content");
  t.assert(post!.content === "Test Content");
});

test.serial("should not create text post (same-uri)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATETEXTPOST,
    variables: {
      uri: "test-uri",
      content: "Test Content"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("should not create text post (no content)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATETEXTPOST,
    variables: {
      uri: "test-uri-123",
      content: ""
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test("shouldn't create text post (not logged in)", async t => {
  const result = await mutate({
    mutation: CREATETEXTPOST,
    variables: {
      uri: "test-uri",
      content: "Test Content"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

//#endregion

//#region Update Text Post

const UPDATETEXTPOST = gql`
  mutation updateTextPost($uri: String!, $content: String!) {
    updateTextPost(uri: $uri, content: $content) {
      content
    }
  }
`;

test.serial("should update text post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: UPDATETEXTPOST,
    variables: {
      uri: "test-uri",
      content: "Test Content 23"
    }
  });

  const post = await TextPostModel.findOne({ uri: "test-uri" });

  t.assert(post);
  t.assert(!result.errors);
  t.assert(result.data);
  t.assert(result.data!.updateTextPost.content === "Test Content 23");
  t.assert(post!.content === "Test Content 23");
});

test.serial("should not update text post (wrong-logged-in-user)", async t => {
  const result = await authorizedApolloClient2.mutate({
    mutation: UPDATETEXTPOST,
    variables: {
      uri: "test-uri",
      content: "Test Content"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("should not update text post (no content)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: UPDATETEXTPOST,
    variables: {
      uri: "test-uri",
      content: ""
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test("shouldn't update text post (not logged in)", async t => {
  const result = await mutate({
    mutation: UPDATETEXTPOST,
    variables: {
      uri: "test-uri",
      content: "Test Content"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

//#endregion

test.after.always(after);
