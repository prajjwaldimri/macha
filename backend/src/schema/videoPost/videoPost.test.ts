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
import { VideoPostModel } from "../../models/VideoPost";

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

  await VideoPostModel.create({
    author: user!._id,
    uri: "novel-uri",
    video: "base/64 encoded video value",
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

//#region Create Video Post

const CREATEVIDEOPOST = gql`
  mutation createVideoPost(
    $uri: String!
    $image: String!
    $caption: String
    $location: String
  ) {
    createVideoPost(
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

test.serial("should create video post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEVIDEOPOST,
    variables: {
      uri: "test-uri",
      video: "base/64 encoded video value",
      caption: "Living life",
      location: "15.401100, 74.011803"
    }
  });

  const post = await VideoPostModel.findOne({ uri: "test-uri" });

  t.assert(post);
  t.assert(!result.errors);
  t.assert(result.data);
  t.assert(result.data!.createVideoPost.caption === "Living life");
  t.assert(post!.caption === "Living life");
  t.assert(result.data!.createVideoPost.location === "15.401100, 74.011803");
  t.assert(post!.location === "15.401100, 74.011803");
});

test.serial("should not create video post(same-uri)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEVIDEOPOST,
    variables: {
      uri: "tset-uri",
      video: "base/64 encoded video value",
      caption: "Lib=ving life",
      location: "15.401100, 74.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("should not create video post (no video)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEVIDEOPOST,
    variables: {
      uri: "test-uri",
      video: "",
      caption: "Living life",
      location: "15.401100, 74.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("should not create video post (wrong location)", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: CREATEVIDEOPOST,
    variables: {
      uri: "test-uri",
      video: "base/64 encoded video value",
      caption: "Living life",
      location: "1523948328947, 1293812937"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test("shouldn't create video post(not logged in)", async t => {
  const result = await mutate({
    mutation: CREATEVIDEOPOST,
    variables: {
      uri: "test-uri",
      video: "base/64 encoded video value",
      caption: "Living life",
      location: "15.401100, 74.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

//#endregion

//#region Update Video Post

const UPDATEVIDEOPOST = gql`
  mutation updateVideoPost($uri String!, $location: String, $caption: String) {
    updateVideoPost(uri: $uri, location: $location, caption: $caption) {
      location
      caption
    }
  }
  `;

test.serial("should update video post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: UPDATEVIDEOPOST,
    variables: {
      uri: "test-uri",
      caption: "Living life large",
      location: "15.401100, 94.011803"
    }
  });

  const post = await VideoPostModel.findOne({ uri: "test-uri" });

  t.assert(post);
  t.assert(!result.errors);
  t.assert(result.data);
  t.assert(result.data!.updateVideoPost.caption === "Living life large");
  t.assert(post!.caption === "Living life large");
  t.assert(result.data!.updateVideoPost.location === "15.401100, 94.011803");
  t.assert(post!.location === "15.401100, 94.011803");
});

test.serial("should not update video post (wrong-logged-in-user)", async t => {
  const result = await authorizedApolloClient2.mutate({
    mutation: UPDATEVIDEOPOST,
    variables: {
      uri: "test-uri",
      caption: "Living life large",
      location: "15.401100, 94.011803"
    }
  });

  t.assert(result.errors);
  t.assert(!result.data);
});

test.serial("shouldn't update video post (not logged in)", async t => {
  const result = await mutate({
    mutation: UPDATEVIDEOPOST,
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

//#region Delete Video Post

const DELETEVIDEOPOST = gql`
  mutation deleteVideoPost($uri: String!) {
    deleteVideoPost(uri: $uri)
  }
`;

test.serial("should not delete the post (not loged in)", async t => {
  const result = await mutate({
    mutation: DELETEVIDEOPOST,
    variables: {
      uri: "novel-uri"
    }
  });

  const videoPost = await VideoPostModel.findOne({ uri: "novel-uri" });

  t.assert(!result.data);
  t.assert(result.errors);
  t.assert(videoPost);
});

test.serial("should not delete the post (wrong-logged-in-user)", async t => {
  const result = await authorizedApolloClient2.mutate({
    mutation: DELETEVIDEOPOST,
    variables: {
      uri: "novel-uri"
    }
  });

  const videoPost = await VideoPostModel.findOne({ uri: "novel-uri" });

  t.assert(!result.data);
  t.assert(result.errors);
  t.assert(videoPost);
});

test.serial("should delete the post", async t => {
  const result = await authorizedApolloClient.mutate({
    mutation: DELETEVIDEOPOST,
    variables: {
      uri: "novel-uri"
    }
  });

  const videoPost = await VideoPostModel.findOne({ uri: "novel-uri" });

  t.assert(result.data);
  t.assert(!result.errors);
  t.assert(videoPost);
});
//#endregion

test.after.always(after);
