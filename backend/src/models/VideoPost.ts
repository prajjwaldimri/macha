import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";

export class VideoPost {
  @prop({
    required: true,
    ref: "User"
  })
  author!: Ref<User>;

  @prop({
    required: true,
    unique: true
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
