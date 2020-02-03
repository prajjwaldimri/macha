import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";

class Like {
  @prop({
    required: true,
    ref: "User"
  })
  author!: Ref<User>;
}

export const LikeModel = getModelForClass(Like);
