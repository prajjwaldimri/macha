import { queryField, stringArg } from "@nexus/schema";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { VideoPostModel } from "../../models/VideoPost";
import isMongoId from "validator/lib/isMongoId";

export const getVideoPost = queryField("getVideoPost", {
  type: "VideoPost",
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
          "Cannot check Video post without logging in"
        );
      }

      let videoPost = await VideoPostModel.findOne({ uri: identifier });

      if (!videoPost && isMongoId(identifier!)) {
        videoPost = await VideoPostModel.findById(identifier);
      }

      if (!videoPost) {
        throw new UserInputError("Given post id or uri doesn't exist");
      }

      return videoPost;
    } catch (err) {
      return err;
    }
  },
});
