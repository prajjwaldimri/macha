import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User, UserModel } from "./User";
import { ImagePost, ImagePostModel } from "./ImagePost";
import { VideoPost, VideoPostModel } from "./VideoPost";
import { TextPost, TextPostModel } from "./TextPost";
import { Comment } from "./Comment";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { NotificationModel } from "./Notification";

export enum LikableType {
  ImagePost = "ImagePost",
  VideoPost = "VideoPost",
  TextPost = "TextPost",
  Comment = "Comment",
}

export class Like extends TimeStamps {
  @prop({
    required: true,
    ref: "User",
  })
  author!: Ref<User>;

  @prop({
    required: true,
    enum: LikableType,
  })
  likableType!: LikableType;

  @prop({
    required: true,
    refPath: "likableType",
  })
  likable!: Ref<ImagePost | TextPost | VideoPost | Comment>;
}

export const LikeModel = getModelForClass(Like);

LikeModel.watch().on("change", async (data: any) => {
  if (data.fullDocument) {
    //Insert operation
    const user = await UserModel.findById(data.fullDocument.author.toString());
    const like = await LikeModel.findById(data.documentKey._id);

    const textPost = await TextPostModel.findById(like!.likable);
    const imagePost = await ImagePostModel.findById(like!.likable);
    const videoPost = await VideoPostModel.findById(like!.likable);

    if (user!.id != textPost?.author && like?.likableType == "TextPost") {
      let notification = {
        content: `${user!.name} liked your post.`,
        user: textPost!.author,
        uri: `/text/${textPost!.uri}`,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    } else if (
      user!.id != imagePost?.author &&
      like?.likableType == "ImagePost"
    ) {
      let notification = {
        content: `${user!.name} liked your post.`,
        user: imagePost!.author,
        uri: `/image/${imagePost!.uri}`,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    } else if (
      user!.id != videoPost?.author &&
      like?.likableType == "VideoPost"
    ) {
      let notification = {
        content: `${user!.name} liked your post.`,
        user: videoPost!.author,
        uri: `/video/${videoPost!.uri}`,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    }
  }
});
