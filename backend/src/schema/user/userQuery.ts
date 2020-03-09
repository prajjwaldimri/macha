import { stringArg, queryField } from "nexus";
import { UserModel } from "../../models/User";

export const me = queryField("me", {
  type: "User",
  async resolve(parent, _, ctx): Promise<any> {
    return ctx.user;
  }
});

export const isUsernameAvailable = queryField("isUsernameAvailable", {
  type: "Boolean",
  args: {
    username: stringArg()
  },
  async resolve(_, { username }, ctx): Promise<any> {
    try {
      const user = await UserModel.findOne({ username });

      if (user) {
        return false;
      }

      return true;
    } catch (err) {
      return err;
    }
  }
});
