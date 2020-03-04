import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { ImagePost } from "./ImagePost";
import { VideoPost } from "./VideoPost";
import { TextPost } from "./TextPost";
import { Comment } from "./Comment";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

enum LikableType {
  ImagePost = "ImagePost",
  VideoPost = "VideoPost",
  TextPost = "TextPost",
  Comment = "Comment"
}

export class Like extends TimeStamps {
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
