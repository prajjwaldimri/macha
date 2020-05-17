import { queryField, stringArg, intArg } from "@nexus/schema";
import { UserContext } from "../types";
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server";
import { TextPostModel } from "../../models/TextPost";
import isMongoId from "validator/lib/isMongoId";
import { UserModel } from "../../models/User";

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

      const user = await UserModel.findOne({ _id: ctx.user._id }).populate({
        path: "machas",
        select: "_id",
      });

      if (!user) {
        throw new UserInputError("No user with the provided id exists");
      }
      // Check if the current user is macha of the other user.
      let machas = user!.machas?.flatMap((macha) => (macha as any)._id);

      // Check if the user asking for the feed is the macha of the other user
      if (machas!.indexOf(textPost!.author) < 0) {
        if (textPost!.author.toString() !== ctx.user._id.toString()) {
          throw new ForbiddenError("Not allowed to view this post.");
        }
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

      const textPosts = await TextPostModel.find({ author: ctx.user._id }).sort(
        "-updatedAt"
      );
      return { textPosts };
    } catch (err) {
      return err;
    }
  },
});
