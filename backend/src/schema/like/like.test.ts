import {
  createTestClient,
  ApolloServerTestClient,
} from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server-micro";

import test from "ava";

import * as allTypes from "../../schema";
import { makeSchema } from "@nexus/schema";

const schema = makeSchema({ types: allTypes });

const server = new ApolloServer({ schema });
const { query, mutate } = createTestClient(server);

let authorizedApolloClient: ApolloServerTestClient;
let authorizedApolloClient2: ApolloServerTestClient;

import { before, after } from "../testutils";
import { UserModel } from "../../models/User";
import { TextPostModel, TextPost } from "../../models/TextPost";
import { DocumentType } from "@typegoose/typegoose";
import { CommentModel, Comment } from "../../models/Comment";
import { LikeModel, Like } from "../../models/Like";

let post: DocumentType<TextPost>;
let comment: DocumentType<Comment>;
let like1: DocumentType<Like>;
let like2: DocumentType<Like>;

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
      name: "Test User",
    },
  });

  await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(--2",
      password: ".sdasdad*&^^%$Jmandb   sdas",
      name: "Test User 2",
    },
  });

  const user = await UserModel.findOne({ username: "test@#!use*(" }).select(
    "-password"
  );

  const user2 = await UserModel.findOne({ username: "test@#!use*(--2" }).select(
    "-password"
  );

  post = await TextPostModel.create({
    author: user!._id,
    uri: "novel-uri",
    content: "Hello",
  });

  comment = await CommentModel.create({
    author: user!._id,
    text: "Nice status!!",
    postType: "TextPost",
    post: post!._id,
  });

  like1 = await LikeModel.create({
    author: user!._id,
    likableType: "TextPost",
    likable: post!._id,
  });

  like2 = await LikeModel.create({
    author: user!._id,
    likableType: "Comment",
    likable: comment!._id,
  });

  authorizedApolloClient = createTestClient(
    new ApolloServer({
      schema,
      context: () => {
        return {
          user: user,
        };
      },
    })
  );

  authorizedApolloClient2 = createTestClient(
    new ApolloServer({
      schema,
      context: () => {
        return {
          user: user2,
        };
      },
    })
  );
});

//#region Like Post

const LIKEPOST = gql`
  mutation likePost($postId: String!) {
    likePost(postId: $postId) {
      author
      authorDetails {
        username
      }
      likable
    }
  }
`;

test.serial("should like the post ", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: LIKEPOST,
    variables: {
      postId: post._id.toString(),
    },
  });

  t.assert(result.data);
  t.assert(!result.errors);
});

test.serial("should not like the post (Wrong post Id)", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: LIKEPOST,
    variables: {
      postId: "&%%^A$SD&*^AS%Hgjahdghjasgdhjastyjt",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not like the post (Not logged in)", async (t) => {
  const result = await mutate({
    mutation: LIKEPOST,
    variables: {
      postId: post._id.toString(),
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

//#endregion

//#region Like Comment

const LIKECOMMENT = gql`
  mutation likeComment($commentId: String!) {
    likeComment(commentId: $commentId) {
      author
      authorDetails {
        username
      }
      likable
    }
  }
`;

test.serial("should like the comment", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: LIKECOMMENT,
    variables: {
      commentId: comment._id.toString(),
    },
  });

  t.assert(!result.errors);
  t.assert(result.data);
});

test.serial("should not like the comment (wrong post id)", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: LIKECOMMENT,
    variables: {
      commentId: "JFH4YYEhgadsfwe92467jjbmkjwut729uesncs",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not like the comment (Not logged in)", async (t) => {
  const result = await mutate({
    mutation: LIKECOMMENT,
    variables: {
      commentId: comment._id.toString(),
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

//#endregion

//#region Unlike Post

const UNLIKEPOST = gql`
  mutation unlikePost($postId: String!) {
    unlikePost(postId: $postId) {
      author
    }
  }
`;

test.serial("should unlike the post", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: UNLIKEPOST,
    variables: {
      postId: post._id.toString(),
    },
  });

  t.assert(result.data);
  t.assert(!result.errors);
});

test.serial("should not unlike the post (Wrong post Id)", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: UNLIKEPOST,
    variables: {
      postId: "&%%^A$SD&*^AS%Hgjahdghjasgdhjastyjt",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not unlike the post (Not logged in)", async (t) => {
  const result = await mutate({
    mutation: UNLIKEPOST,
    variables: {
      postId: post._id.toString(),
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

//#endregion

//#region Unlike Comment

const UNLIKECOMMENT = gql`
  mutation unlikeComment($commentId: String!) {
    unlikeComment(commentId: $commentId) {
      author
    }
  }
`;

test.serial("should unlike the comment", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: UNLIKECOMMENT,
    variables: {
      commentId: comment._id.toString(),
    },
  });
  const like = await LikeModel.findById(like2._id);
  t.assert(result.data);
  t.assert(!result.errors);
  t.assert(!like);
});

test.serial("should not unlike the comment (Wrong comment Id)", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: UNLIKECOMMENT,
    variables: {
      commentId: "hcgsjcsjkjiw67tqyw17@$$mshabhxx",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not unlike the comment (Not logged in)", async (t) => {
  const result = await mutate({
    mutation: UNLIKECOMMENT,
    variables: {
      commentId: comment._id.toString(),
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});
//#endregion

test.after.always(after);
