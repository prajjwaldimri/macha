import { objectType } from "@nexus/schema";

export const Notification = objectType({
  name: "Notification",
  definition(t) {
    t.implements("Node");
    t.implements("Timestamp");
    t.string("uri", { nullable: false });
    t.string("image", { nullable: true });
    t.string("content", { nullable: false });
  },
});

export const Notifications = objectType({
  name: "Notifications",
  definition(t) {
    t.list.field("notifications", { type: "Notification" });
  },
});
