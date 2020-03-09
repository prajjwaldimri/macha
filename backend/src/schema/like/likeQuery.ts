import { queryField, stringArg } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { LikeModel } from "../../models/Like";
import isMongoId from "validator/lib/isMongoId";

export const getLike = queryField("getLike", {
  type: "Like",
  args: { likeId: stringArg() },
  async resolve(_, { likeId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check the likes without logging in"
        );
      }

      const like = await LikeModel.findById(likeId);

      if (!like) {
        throw new UserInputError("Given like id doesn't exist");
      }

      return like;
    } catch (err) {
      return err;
    }
  }
});

export const getLikers = queryField("getLikers", {
  type: "Likers",
  args: {
    identifier: stringArg({ description: "Can be postId or commentId" })
  },
  async resolve(_, { identifier }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot get the likers detail without logging in"
        );
      }
      if (!isMongoId(identifier!)) {
        throw new UserInputError("identifier should be a post or comment id");
      }
      const likes = await LikeModel.find({ likable: identifier }).select(
        "author"
      );

      if (!likes) {
        throw new UserInputError("Given identifier doesn't exist");
      }

      return { likes };
    } catch (err) {
      return err;
    }
  }
});
