import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import nanoid from "nanoid";

export class ImagePost extends TimeStamps {
  @prop({
    required: true,
    ref: "User"
  })
  author!: Ref<User>;

  @prop({
    required: true,
    unique: true,
    default: () => nanoid()
  })
  uri!: string;

  @prop({ required: true })
  image!: string;

  @prop()
  location?: string;

  @prop()
  caption?: string;
}

export const ImagePostModel = getModelForClass(ImagePost);
