import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";

export class ImagePost {
  @prop({
    required: true,
    unique: true,
    ref: "User"
  })
  author!: Ref<User>;

  @prop({
    required: true,
    unique: true
  })
  uri!: string;

  @prop({ required: true })
  image!: string;

  @prop({})
  location!: string;

  @prop({})
  caption!: string;
}

export const ImagePostModel = getModelForClass(ImagePost);
