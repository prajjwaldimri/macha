import { stringArg, queryField } from "@nexus/schema";
import { UserModel } from "../../models/User";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";

export const me = queryField("me", {
  type: "User",
  async resolve(parent, _, ctx: UserContext): Promise<any> {
    if (!ctx.user) {
      throw new AuthenticationError("Not logged in");
    }
    return UserModel.findOne({ _id: ctx.user?._id }).select("-password");
  },
});

export const isUsernameAvailable = queryField("isUsernameAvailable", {
  type: "Boolean",
  args: {
    username: stringArg({ required: true }),
  },
  async resolve(_, { username }, ctx): Promise<any> {
    try {
      if (!username) {
        throw new UserInputError("Username wrong");
      }
      const user = await UserModel.findOne({ username });

      if (user) {
        return false;
      }

      return true;
    } catch (err) {
      return err;
    }
  },
});
