import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { ImagePost } from "./ImagePost";
import { VideoPost } from "./VideoPost";
import { TextPost } from "./TextPost";
import { TimeStamps, Base } from "@typegoose/typegoose/lib/defaultClasses";

enum PostType {
  ImagePost = "ImagePost",
  VideoPost = "VideoPost",
  TextPost = "TextPost"
}

export class Comment extends TimeStamps {
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
    enum: PostType
  })
  postType!: PostType;

  @prop({
    required: true,
    refPath: "postType"
  })
  post!: Ref<ImagePost | VideoPost | TextPost>;
}

export const CommentModel = getModelForClass(Comment);
