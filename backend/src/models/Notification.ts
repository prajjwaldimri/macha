import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import { User } from "./User";
import { newNotificationCallback } from "../schema/notification/notificationSchemaModelBridge";

export class Notification extends TimeStamps {
  @prop({
    required: true,
    ref: "User",
  })
  user!: Ref<User>;

  @prop({
    required: true,
  })
  uri!: string;

  @prop({})
  image!: string;

  @prop({
    required: true,
  })
  content!: string;
}

export const NotificationModel = getModelForClass(Notification);

NotificationModel.watch().on("change", (data) => {
  newNotificationCallback(data);
});
