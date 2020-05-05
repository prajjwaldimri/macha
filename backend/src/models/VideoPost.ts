import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import nanoid from "nanoid";

export class VideoPost extends TimeStamps {
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
  video!: string;

  @prop()
  caption?: string;

  @prop()
  location?: string;
}

export const VideoPostModel = getModelForClass(VideoPost);
