import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { ImagePost } from "./ImagePost";
import { VideoPost } from "./VideoPost";
import { TextPost } from "./TextPost";

enum PostType {
  ImagePost = "ImagePost",
  VideoPost = "VideoPost",
  TextPost = "TextPost"
}

class Like {
  @prop({
    required: true,
    ref: "User"
  })
  author!: Ref<User>;

  @prop({
    required: true,
    enum: PostType
  })
  postType!: PostType;

  @prop({
    required: true,
    refPath: "postType"
  })
  post!: Ref<ImagePost | TextPost | VideoPost>;
}

export const LikeModel = getModelForClass(Like);
