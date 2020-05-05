import { subscriptionField } from "@nexus/schema";
import { AuthenticationError } from "apollo-server";

export const notificationSubscription = subscriptionField("notificationSub", {
  type: "Notification",
  subscribe: (_, __, ctx): any => {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Not allowed to subscribe");
      }
      return ctx.pubsub.asyncIterator(["NOTIFICATIONS"]);
    } catch (err) {
      return err;
    }
  },
  resolve(payload) {
    return payload;
  },
});
