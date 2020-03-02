import { mutationField, stringArg } from "nexus";
import { UserContext } from "../types";
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError
} from "apollo-server";
import { TextPostModel, TextPost } from "../../models/TextPost";
import { ImagePostModel, ImagePost } from "../../models/ImagePost";
import { VideoPostModel, VideoPost } from "../../models/VideoPost";
import { CommentModel } from "../../models/Comment";
import isLength from "validator/lib/isLength";
import { resolve } from "dns";

export const createComment = mutationField("createComment", {
  type: "Comment",
  args: {
    postId: stringArg({ required: true }),
    text: stringArg({ required: true })
  },
  async resolve(_, { postId, text }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot comment without logging in");
      }

      if (!isLength(text.trim(), { min: 1 })) {
        throw new UserInputError("content should not be empty");
      }

      const textPost = await TextPostModel.findById(postId);
      const imagePost = await ImagePostModel.findById(postId);
      const videoPost = await VideoPostModel.findById(postId);

      if (!textPost && !imagePost && !videoPost) {
        throw new UserInputError("No post found with the given id");
      }

      if (textPost) {
        return await CommentModel.create({
          author: ctx.user._id,
          postType: "TextPost",
          post: postId,
          text
        });
      } else if (imagePost) {
        return await CommentModel.create({
          author: ctx.user._id,
          postType: "ImagePost",
          post: postId,
          text
        });
      } else if (videoPost) {
        return await CommentModel.create({
          author: ctx.user._id,
          postType: "VideoPost",
          post: postId,
          text
        });
      }
    } catch (err) {
      return err;
    }
  }
});

export const updateComment = mutationField("updateComment", {
  type: "Comment",
  args: {
    commentId: stringArg({ required: true }),
    text: stringArg({ required: true })
  },
  async resolve(_, { commentId, text }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot like without logging in");
      }

      if (!isLength(text.trim(), { min: 1 })) {
        throw new UserInputError("content should not be empty");
      }

      const comment = await CommentModel.findById(commentId);

      if (!comment) {
        throw new UserInputError("No comment with the given id exists");
      }

      if (comment.author.toString() !== ctx.user._id.toString()) {
        throw new ForbiddenError(
          "Not allowed to update the comment as the logged in user is not the author of the comment"
        );
      }

      return await CommentModel.findByIdAndUpdate(
        commentId,
        { text: text },
        { new: true }
      );
    } catch (err) {
      return err;
    }
  }
});

export const deleteComment = mutationField("deleteComment", {
  type: "Comment",
  args: {
    commentId: stringArg({ required: true })
  },
  async resolve(_, { commentId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot delete the comment without logging in"
        );
      }

      const comment = await CommentModel.findById(commentId);

      if (!comment) {
        throw new UserInputError("No comment with the given id exists");
      }

      let isPostAuthor = false;
      let post: TextPost | ImagePost | VideoPost | null = null;

      switch (comment.postType) {
        case "TextPost":
          post = await TextPostModel.findById(comment.post);
          break;
        case "ImagePost":
          post = await ImagePostModel.findById(comment.post);
          break;
        case "VideoPost":
          post = await VideoPostModel.findById(comment.post);
          break;
      }

      if (!post) {
        throw new UserInputError("Post doesn't exists");
      }

      if (
        comment.author.toString() !== ctx.user._id.toString() &&
        post?.author.toString() !== ctx.user._id.toString()
      ) {
        throw new ForbiddenError("Not allowed to delete the comment");
      }

      return await comment.remove();
    } catch (err) {
      return err;
    }
  }
});
