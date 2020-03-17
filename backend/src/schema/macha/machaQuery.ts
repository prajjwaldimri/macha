import { queryField } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { UserModel } from "../../models/User";

export const getMachas = queryField("getMachas", {
  type: "Machas",
  async resolve(_, {}, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot get machas without logging in");
      }

      const user = await UserModel.findById(ctx.user._id)
        .select("machas")
        .populate("machas");

      if (!user) {
        throw new UserInputError("No machas are added yet");
      }

      return { machas: user.machas! };
    } catch (err) {
      return err;
    }
  }
});
