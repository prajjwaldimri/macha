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

test.after.always(after);
