import { mutationField } from "@nexus/schema";
import { UserContext } from "../types";
import { AuthenticationError } from "apollo-server";
import { NotificationModel } from "../../models/Notification";

export const clearNotifications = mutationField("clearNotifications", {
  type: "Boolean",
  async resolve(_, __, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check the text post without logging in"
        );
      }
      await NotificationModel.deleteMany({ user: ctx.user._id });
      return true;
    } catch (err) {
      return err;
    }
  },
});
