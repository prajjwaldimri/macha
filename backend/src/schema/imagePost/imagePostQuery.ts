import { queryField, stringArg, intArg } from "@nexus/schema";
import { UserContext } from "../types";
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server";
import { ImagePostModel } from "../../models/ImagePost";
import isMongoId from "validator/lib/isMongoId";
import { UserModel } from "../../models/User";

export const getImagePost = queryField("getImagePost", {
  type: "ImagePost",
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
          "Cannot check image post without logging in"
        );
      }

      let imagePost = await ImagePostModel.findOne({ uri: identifier });

      // const user = await UserModel.findOne({ _id: ctx.user._id }).populate({
      //   path: "machas",
      //   select: "_id",
      // });

      // if (!user) {
      //   throw new UserInputError("No user with the provided id exists");
      // }
      // // Check if the current user is macha of the other user.
      // let machas = user!.machas?.flatMap((macha) => (macha as any)._id);

      // // Check if the user asking for the feed is the macha of the other user
      // if (machas!.indexOf(imagePost!.author) < 0) {
      //   if (imagePost!.author.toString() !== ctx.user._id.toString()) {
      //     throw new ForbiddenError("Not allowed to view this post.");
      //   }
      // }

      if (!imagePost && isMongoId(identifier!)) {
        imagePost = await ImagePostModel.findById(identifier);
      }

      if (!imagePost) {
        throw new UserInputError("Given post id or uri doesn't exist");
      }
      return imagePost;
    } catch (err) {
      return err;
    }
  },
});

export const getImagePostsOfUser = queryField("getImagePostsOfUser", {
  type: "ImagePostList",
  args: {
    count: intArg({ default: 9 }),
    skip: intArg({ default: 0 }),
  },
  async resolve(_, { count, skip }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot get image posts without logging in"
        );
      }

      const imagePosts = await ImagePostModel.find({
        author: ctx.user._id,
      }).sort("-updatedAt");
      return { imagePosts };
    } catch (err) {
      return err;
    }
  },
});
