import { mutationField, stringArg } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { TextPostModel } from "../../models/TextPost";
import { ImagePostModel } from "../../models/ImagePost";
import { VideoPostModel } from "../../models/VideoPost";
import { LikeModel } from "../../models/Like";
import { CommentModel } from "../../models/Comment";

export const likePost = mutationField("likePost", {
  type: "Like",
  args: {
    postId: stringArg({ required: true })
  },
  async resolve(_, { postId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot like without logging in");
      }

      // https://stackoverflow.com/questions/4677237/possibility-of-duplicate-mongo-objectids-being-generated-in-two-different-colle/10183273

      const textPost = await TextPostModel.findById(postId);
      const imagePost = await ImagePostModel.findById(postId);
      const videoPost = await VideoPostModel.findById(postId);

      if (!textPost && !imagePost && !videoPost) {
        throw new UserInputError("No post found with the given id");
      }

      if (textPost) {
        return await LikeModel.create({
          author: ctx.user._id,
          likableType: "TextPost",
          likable: postId
        });
      } else if (imagePost) {
        return await LikeModel.create({
          author: ctx.user._id,
          likableType: "ImagePost",
          likable: postId
        });
      } else if (videoPost) {
        return await LikeModel.create({
          author: ctx.user._id,
          likableType: "VideoPost",
          likable: postId
        });
      }
    } catch (err) {
      return err;
    }
  }
});

export const likeComment = mutationField("likeComment", {
  type: "Like",
  args: {
    commentId: stringArg({ required: true })
  },
  async resolve(_, { commentId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot like without logging in");
      }

      const comment = await CommentModel.findById(commentId);

      if (!comment) {
        throw new UserInputError("No comment found with the given id");
      }

      return await LikeModel.create({
        author: ctx.user._id,
        likableType: "Comment",
        likable: commentId
      });
    } catch (err) {
      return err;
    }
  }
});

export const unlikePost = mutationField("unlikePost", {
  type: "Like",
  args: {
    postId: stringArg({ required: true })
  },
  async resolve(_, { postId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot unlike without logging in");
      }

      const textPost = await TextPostModel.findById(postId);
      const imagePost = await ImagePostModel.findById(postId);
      const videoPost = await VideoPostModel.findById(postId);

      if (!textPost && !imagePost && !videoPost) {
        throw new UserInputError("No post found with the given id");
      }

      if (textPost) {
        return await LikeModel.findOneAndDelete({
          author: ctx.user!._id,
          likableType: "TextPost",
          likable: textPost._id
        });
      } else if (imagePost) {
        return await LikeModel.findOneAndDelete({
          author: ctx.user!._id,
          likableType: "ImagePost",
          likable: imagePost._id
        });
      } else if (videoPost) {
        return await LikeModel.findOneAndDelete({
          author: ctx.user!._id,
          likableType: "VideoPost",
          likable: videoPost._id
        });
      }
    } catch (err) {
      return err;
    }
  }
});

export const unlikeComment = mutationField("unlikeComment", {
  type: "Like",
  args: {
    commentId: stringArg({ required: true })
  },
  async resolve(_, { commentId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot unlike without logging in");
      }

      const comment = await CommentModel.findById(commentId);

      if (!comment) {
        throw new UserInputError("No comment found with the given id");
      }

      return await LikeModel.findOneAndDelete({
        author: ctx.user!._id,
        likableType: "Comment",
        likable: comment._id
      });
    } catch (err) {
      return err;
    }
  }
});
