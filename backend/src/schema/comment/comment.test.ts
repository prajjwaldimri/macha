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
let authorizedApolloClient3: ApolloServerTestClient;

import { before, after } from "../testutils";
import { UserModel } from "../../models/User";
import { TextPostModel, TextPost } from "../../models/TextPost";
import { DocumentType } from "@typegoose/typegoose";
import { CommentModel, Comment } from "../../models/Comment";

let postId: DocumentType<TextPost>;

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

  await mutate({
    mutation: CREATEUSER,
    variables: {
      username: "test@#!use*(--3",
      password: ".sdasdad*&^^%$Jmandb   sdas",
      name: "Test User 3",
    },
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

  postId = await TextPostModel.create({
    author: user!._id,
    uri: "novel-uri",
    content: "Hello",
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

  authorizedApolloClient3 = createTestClient(
    new ApolloServer({
      schema,
      context: () => {
        return {
          user: user3,
        };
      },
    })
  );
});

//#region Create Comment

const CREATECOMMENT = gql`
  mutation createComment($postId: String!, $text: String!) {
    createComment(postId: $postId, text: $text) {
      id
      author
      authorDetails {
        username
      }
      text
    }
  }
`;

let createdComment: DocumentType<Comment> | null;
let createdComment2: DocumentType<Comment> | null;

test.serial("should create a comment", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: CREATECOMMENT,
    variables: {
      postId: postId._id.toString(),
      text: "Hello",
    },
  });

  t.assert(result.data);
  createdComment = await CommentModel.findById(result.data!.createComment.id);
  t.assert(!result.errors);
});

test.serial("should create another comment", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: CREATECOMMENT,
    variables: {
      postId: postId._id.toString(),
      text: "Hello World",
    },
  });

  t.assert(result.data);
  createdComment2 = await CommentModel.findById(result.data!.createComment.id);
  t.assert(!result.errors);
});

test.serial("should not create a comment (Wrong post Id)", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: CREATECOMMENT,
    variables: {
      postId: "&%%^A$SD&*^AS%Hgjahdghjasgdhjastyjt",
      text: "Yo",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not create a comment (Not logged in)", async (t) => {
  const result = await mutate({
    mutation: CREATECOMMENT,
    variables: {
      postId: postId._id.toString(),
      text: "asdsa",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not create a comment (Empty text)", async (t) => {
  const result = await mutate({
    mutation: CREATECOMMENT,
    variables: {
      postId: postId._id.toString(),
      text: "                     ",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

//#endregion

//#region Update Comment

const UPDATECOMMENT = gql`
  mutation updateComment($commentId: String!, $text: String!) {
    updateComment(commentId: $commentId, text: $text) {
      author
      authorDetails {
        username
      }
      text
    }
  }
`;

test.serial("should update comment", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: UPDATECOMMENT,
    variables: {
      commentId: createdComment!._id.toString(),
      text: "Hello",
    },
  });

  t.assert(result.data);
  t.assert(!result.errors);
  t.assert(result.data!.updateComment.text === "Hello");
});

test.serial("should not update comment (Wrong comment Id)", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: UPDATECOMMENT,
    variables: {
      commentId: "ASKJLDHAKJSDHAJKSU^&*%^&^%$%^&",
      text: "Hello",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not update comment (Not logged in)", async (t) => {
  const result = await mutate({
    mutation: UPDATECOMMENT,
    variables: {
      commentId: createdComment!._id.toString(),
      text: "Hello",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not update comment (Wrong logged in user)", async (t) => {
  const result = await authorizedApolloClient3.mutate({
    mutation: UPDATECOMMENT,
    variables: {
      commentId: createdComment!._id.toString(),
      text: "Hello",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("should not update comment (Empty text)", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: UPDATECOMMENT,
    variables: {
      commentId: createdComment!._id.toString(),
      text: "                      ",
    },
  });

  t.assert(!result.data);
  t.assert(result.errors);
});

//#endregion

//#region Delete Comment

const DELETECOMMENT = gql`
  mutation deleteComment($commentId: String!) {
    deleteComment(commentId: $commentId) {
      author
    }
  }
`;

test.serial("should not delete the comment (Wrong comment Id)", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: DELETECOMMENT,
    variables: {
      commentId: "ASKJLDHAKJSDHAJKSU^&*%^&^%$%^&",
    },
  });

  const comment = await CommentModel.findById(createdComment!._id.toString());

  t.assert(comment);
  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial("shoud not delete the comment (Not logged in)", async (t) => {
  const result = await mutate({
    mutation: DELETECOMMENT,
    variables: {
      commentId: createdComment!._id.toString(),
    },
  });

  const comment = await CommentModel.findById(createdComment!._id.toString());

  t.assert(comment);
  t.assert(!result.data);
  t.assert(result.errors);
});

test.serial(
  "should not delete the comment (Wrong logged in user)",
  async (t) => {
    const result = await authorizedApolloClient3.mutate({
      mutation: DELETECOMMENT,
      variables: {
        commentId: createdComment!._id.toString(),
      },
    });

    const comment = await CommentModel.findById(createdComment!._id.toString());

    t.assert(comment);
    t.assert(!result.data);
    t.assert(result.errors);
  }
);

test.serial("should delete the comment (author of the comment)", async (t) => {
  const result = await authorizedApolloClient2.mutate({
    mutation: DELETECOMMENT,
    variables: {
      commentId: createdComment!._id.toString(),
    },
  });

  const comment = await CommentModel.findById(createdComment!._id.toString());

  t.assert(!comment);
  t.assert(result.data);
  t.assert(!result.errors);
});

test.serial("should delete the comment (owner of the post)", async (t) => {
  const result = await authorizedApolloClient.mutate({
    mutation: DELETECOMMENT,
    variables: {
      commentId: createdComment2!._id.toString(),
    },
  });

  const comment = await CommentModel.findById(createdComment2!._id.toString());

  t.assert(!comment);
  t.assert(result.data);
  t.assert(!result.errors);
});

//#endregion
test.after.always(after);
