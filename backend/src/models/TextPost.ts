import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";

export class TextPost {
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

  @prop({
    required: true
  })
  content!: string;
}

export const TextPostModel = getModelForClass(TextPost);
