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

  await ImagePostModel.create({
    author: user!._id,
    uri: "novel-uri",
    image: "base/64 encoded image value",
    caption: "Hello world",
    location: "15.401100, 74.011803"
  });

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
  t.assert(result.data!.createVideoPost.caption === "Living life");
  t.assert(post!.caption === "Living life");
  t.assert(result.data!.createVideoPost.location === "15.401100, 74.011803");
  t.assert(post!.location === "15.401100, 74.011803");
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

//#region Update Image Post

const UPDATEIMAGEPOST = gql`
  mutation updateImagePost($uri String!, $location: String, $caption: String) {
    updateImagePost(uri: $uri, location: $location, caption: $caption) {
      location
      caption
    }
  }
  `;

test.serial("should update image post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: UPDATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      caption: "Living life large",
      location: "15.401100, 94.011803"
    }
  });

  const post = await ImagePostModel.findOne({ uri: "test-uri" });

  t.assert(post);
  t.assert(!result.errors);
  t.assert(result.data);
  t.assert(result.data!.updateImagePost.caption === "Living life large");
  t.assert(post!.caption === "Living life large");
  t.assert(result.data!.updateImagePost.location === "15.401100, 94.011803");
  t.assert(post!.location === "15.401100, 94.011803");
});

test.serial("should not update image post (wrong-logged-in-user)", async t => {
  const result = await authorizedApolloClient2.mutate({
    mutation: UPDATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      caption: "Living life large",
      location: "15.401100, 94.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("shouldn't update image post (not logged in)", async t => {
  const result = await mutate({
    mutation: UPDATEIMAGEPOST,
    variables: {
      uri: "test-uri",
      caption: "Living life large",
      location: "15.401100, 94.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

//#endregion

//#region Delete ImagePost

const DELETEIMAGEPOST = gql`
  mutation deleteImagePost($uri: String!) {
    deleteImagePost(uri: $uri)
  }
`;

test.serial("should not delete the post (not loged in)", async t => {
  const result = await mutate({
    mutation: DELETEIMAGEPOST,
    variables: {
      uri: "novel-uri"
    }
  });

  const imagePost = await ImagePostModel.findOne({ uri: "novel-uri" });

  t.assert(!result.data);
  t.assert(result.errors);
  t.assert(imagePost);
});

test.serial("should not delete the post (wrong-logged-in-user)", async t => {
  const result = await authorizedApolloClient2.mutate({
    mutation: DELETEIMAGEPOST,
    variables: {
      uri: "novel-uri"
    }
  });

  const imagePost = await ImagePostModel.findOne({ uri: "novel-uri" });

  t.assert(!result.data);
  t.assert(result.errors);
  t.assert(imagePost);
});

test.serial("should delete the post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: DELETEIMAGEPOST,
    variables: {
      uri: "novel-uri"
    }
  });

  const imagePost = await ImagePostModel.findOne({ uri: "novel-uri" });

  t.assert(result.data);
  t.assert(!result.errors);
  t.assert(imagePost);
});
//#endregion
test.after.always(after);
