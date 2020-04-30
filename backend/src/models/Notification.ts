import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import { User } from "./User";
import nanoid from "nanoid";

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

  @prop({
    required: true,
  })
  content!: string;
}

export const NotificationModel = getModelForClass(Notification);
