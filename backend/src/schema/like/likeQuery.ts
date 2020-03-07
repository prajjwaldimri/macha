import { queryField, stringArg } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { LikeModel } from "../../models/Like";
import { resolve } from "dns";

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
