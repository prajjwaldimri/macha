import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { ImagePost } from "./ImagePost";
import { VideoPost } from "./VideoPost";
import { TextPost } from "./TextPost";

class Comment {
  @prop({
    required: true,
    ref: "User"
  })
  author!: Ref<User>;

  @prop({
    required: true
  })
  text!: string;

  @prop({
    required: true,
    enum: "ImagePost" | "VideoPost" | "TextPost"
  })
  postType!: string;
}

export const CommentModel = getModelForClass(Comment);
