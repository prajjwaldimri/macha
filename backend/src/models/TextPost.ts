import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";

class TextPost {
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

  @prop({
    required: true
  })
  content!: string;
}
