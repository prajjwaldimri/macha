import { queryField } from "@nexus/schema";
import { UserContext } from "../types";
import { AuthenticationError } from "apollo-server";
import { NotificationModel } from "../../models/Notification";

export const getNotifications = queryField("getNotifications", {
  type: "Notifications",
  async resolve(_, __, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check the text post without logging in"
        );
      }

      const notifications = NotificationModel.find({ user: ctx.user._id });
      return { notifications };
    } catch (err) {
      return err;
    }
  },
});
