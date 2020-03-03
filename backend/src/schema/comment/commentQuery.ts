import { queryField } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError } from "apollo-server";
import { UserModel } from "../../models/User";

export const getComment = queryField("getComment", {
  type: "Comment",
  args: {},
  async resolve(_, {}, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check the comments without logging in"
        );
      }

      const user = await UserModel.findById(ctx.user._id);
    } catch (err) {
      return err;
    }
  }
});
