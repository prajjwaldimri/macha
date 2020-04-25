import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import nanoid from "nanoid";

export class Feedback extends TimeStamps {
  @prop({
    required: true,
    ref: "User",
  })
  author!: Ref<User>;

  @prop({
    required: true,
    unique: true,
    default: () => nanoid(),
  })
  uri!: string;

  @prop({ required: true })
  message!: string;

  @prop({ required: true })
  log!: string;
}

export const FeedbackModel = getModelForClass(Feedback);
