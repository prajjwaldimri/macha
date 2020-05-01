import { subscriptionField } from "@nexus/schema";
import { AuthenticationError } from "apollo-server";

let savedCtx: any = undefined;

export const notificationSubscription = subscriptionField("notificationSub", {
  type: "Notification",
  subscribe: (_, __, ctx): any => {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Not allowed to subscribe");
      }
      savedCtx = ctx;
      return ctx.pubsub.asyncIterator(["NOTIFICATIONS"]);
    } catch (err) {
      return err;
    }
  },
  resolve(payload) {
    return payload;
  },
});

export const pushNotification = (data: any) => {
  if (savedCtx) {
    if (data.user.toString() === savedCtx.user._id.toString()) {
      savedCtx.pubsub.publish("NOTIFICATIONS", data);
    }
  }
};
