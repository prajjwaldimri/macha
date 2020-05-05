import { queryField, stringArg, intArg } from "@nexus/schema";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { TextPostModel } from "../../models/TextPost";
import isMongoId from "validator/lib/isMongoId";

export const getTextPost = queryField("getTextPost", {
  type: "TextPost",
  args: {
    identifier: stringArg({
      description: "Can be postId or uri",
      required: true,
    }),
  },
  async resolve(_, { identifier }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check the text post without logging in"
        );
      }

      let textPost = await TextPostModel.findOne({ uri: identifier });

      if (!textPost && isMongoId(identifier!)) {
        textPost = await TextPostModel.findById(identifier);
      }

      if (!textPost) {
        throw new UserInputError("Given post id or uri doesn't exist");
      }

      return textPost;
    } catch (err) {
      return err;
    }
  },
});

export const getTextPostsOfUser = queryField("getTextPostsOfUser", {
  type: "TextPostList",
  args: {
    count: intArg({ default: 9 }),
    skip: intArg({ default: 0 }),
  },
  async resolve(_, { count, skip }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot get text posts without logging in"
        );
      }

      const textPosts = await TextPostModel.find({ author: ctx.user._id });
      return { textPosts };
    } catch (err) {
      return err;
    }
  },
});
