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

export const getLikersPost = queryField("getLikersPost", {
  type: "Likers",
  args: {
    identifier: stringArg()
  },
  async resolve(_, { identifier }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot get the likers detail without logging in"
        );
      }

      const likes = await LikeModel.find({ likable: identifier }).select(
        "author"
      );

      if (!likes) {
        throw new UserInputError("Given postid doesn't exist");
      }

      return { likes };
    } catch (err) {
      return err;
    }
  }
});
