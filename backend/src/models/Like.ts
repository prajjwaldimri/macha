import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { ImagePost } from "./ImagePost";
import { VideoPost } from "./VideoPost";
import { TextPost } from "./TextPost";
import { Comment } from "./Comment";

enum LikableType {
  ImagePost = "ImagePost",
  VideoPost = "VideoPost",
  TextPost = "TextPost",
  Comment = "Comment"
}

class Like {
  @prop({
    required: true,
    ref: "User"
  })
  author!: Ref<User>;

  @prop({
    required: true,
    enum: LikableType
  })
  likableType!: LikableType;

  @prop({
    required: true,
    refPath: "likableType"
  })
  likable!: Ref<ImagePost | TextPost | VideoPost | Comment>;
}

export const LikeModel = getModelForClass(Like);
