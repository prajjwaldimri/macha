import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User, UserModel } from "./User";
import { ImagePost, ImagePostModel } from "./ImagePost";
import { VideoPost, VideoPostModel } from "./VideoPost";
import { TextPost, TextPostModel } from "./TextPost";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { NotificationModel } from "./Notification";

enum PostType {
  ImagePost = "ImagePost",
  VideoPost = "VideoPost",
  TextPost = "TextPost",
}

export class Comment extends TimeStamps {
  @prop({
    required: true,
    ref: "User",
  })
  author!: Ref<User>;

  @prop({
    required: true,
  })
  text!: string;

  @prop({
    required: true,
    enum: PostType,
  })
  postType!: PostType;

  @prop({
    required: true,
    refPath: "postType",
  })
  post!: Ref<ImagePost | VideoPost | TextPost>;
}

export const CommentModel = getModelForClass(Comment);

CommentModel.watch().on("change", async (data: any) => {
  if (data.fullDocument) {
    //Insert operation
    const user = await UserModel.findById(data.fullDocument.author.toString());
    const comment = await CommentModel.findById(data.documentKey._id);

    const textPost = await TextPostModel.findById(comment!.post);
    const imagePost = await ImagePostModel.findById(comment!.post);
    const videoPost = await VideoPostModel.findById(comment!.post);

    if (user!.id != textPost?.author && comment?.postType == "TextPost") {
      let notification = {
        content: `${user!.name} commented on your post.`,
        user: textPost!.author,
        uri: textPost!.uri,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    } else if (
      user!.id != imagePost?.author &&
      comment?.postType == "ImagePost"
    ) {
      let notification = {
        content: `${user!.name} commented on your post.`,
        user: imagePost!.author,
        uri: imagePost!.uri,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    } else if (
      user!.id != videoPost?.author &&
      comment?.postType == "VideoPost"
    ) {
      let notification = {
        content: `${user!.name} commented on your post.`,
        user: videoPost!.author,
        uri: videoPost!.uri,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    }
  } else if (data.updateDescription) {
    // Update operation
    const comment = await CommentModel.findById(data.documentKey._id);
    const user = await UserModel.findById(comment!.author.toString());

    const textPost = await TextPostModel.findById(comment!.post);
    const imagePost = await ImagePostModel.findById(comment!.post);
    const videoPost = await VideoPostModel.findById(comment!.post);

    if (user!.id != textPost?.author && comment?.postType == "TextPost") {
      let notification = {
        content: `${user!.name} updated their comment.`,
        user: textPost!.author,
        uri: textPost!.uri,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    } else if (
      user!.id != imagePost?.author &&
      comment?.postType == "ImagePost"
    ) {
      let notification = {
        content: `${user!.name} updated their comment.`,
        user: imagePost!.author,
        uri: imagePost!.uri,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    } else if (
      user!.id != videoPost?.author &&
      comment?.postType == "VideoPost"
    ) {
      let notification = {
        content: `${user!.name} updated their comment.`,
        user: videoPost!.author,
        uri: videoPost!.uri,
        image: user?.profileImage,
      };
      await NotificationModel.create(notification);
    }
  }
});
