import { queryField, stringArg, intArg } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { ImagePostModel } from "../../models/ImagePost";
import isMongoId from "validator/lib/isMongoId";

export const getImagePost = queryField("getImagePost", {
  type: "ImagePost",
  args: {
    identifier: stringArg({
      description: "Can be postId or uri",
      required: true
    })
  },
  async resolve(_, { identifier }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check image post without logging in"
        );
      }

      let imagePost = await ImagePostModel.findOne({ uri: identifier });

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
  }
});

export const getImagePostsOfUser = queryField("getImagePostsOfUser", {
  type: "ImagePostList",
  args: {
    count: intArg({ default: 9 }),
    skip: intArg({ default: 0 })
  },
  async resolve(_, { count, skip }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot get image posts without logging in"
        );
      }

      const imagePosts = await ImagePostModel.find({ author: ctx.user._id });
      return { imagePosts };
    } catch (err) {
      return err;
    }
  }
});
