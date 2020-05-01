import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User, UserModel } from "./User";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import nanoid from "nanoid";
import { NotificationModel } from "./Notification";

export class ImagePost extends TimeStamps {
  @prop({
    required: true,
    ref: "User",
  })
  author!: Ref<User>;

  @prop({
    required: true,
    unique: true,
    default: () => nanoid(),
  })
  uri!: string;

  @prop({ required: true })
  image!: string;

  @prop()
  location?: string;

  @prop()
  caption?: string;
}

export const ImagePostModel = getModelForClass(ImagePost);

ImagePostModel.watch().on("change", async (data: any) => {
  if (data.fullDocument) {
    //Insert operation
    const user = await UserModel.findById(
      data.fullDocument.author.toString()
    ).populate({
      path: "machas",
      select: "id",
    });
    let machas = user!.machas?.flatMap((macha) => (macha as any)._id);
    if (!machas) {
      return;
    }
    for (let macha of machas) {
      let notification = {
        content: `${user!.name} created a new post.`,
        user: macha,
        uri: data.fullDocument.uri,
        image: user?.profileImage,
      };

      await NotificationModel.create(notification);
    }
  } else if (data.updateDescription) {
    // Update operation
    const post = await ImagePostModel.findById(data.documentKey._id);
    const user = await UserModel.findById(post!.author.toString()).populate({
      path: "machas",
      select: "_id",
    });
    let machas = user!.machas?.flatMap((macha) => (macha as any)._id);
    if (!machas) {
      return;
    }
    for (let macha of machas) {
      let notification = {
        content: `${user!.name} updated their post.`,
        user: macha,
        uri: post!.uri,
        image: user?.profileImage,
      };

      await NotificationModel.create(notification);
    }
  }
});
