import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User, UserModel } from "./User";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import nanoid from "nanoid";
import { NotificationModel } from "./Notification";

export class TextPost extends TimeStamps {
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

  @prop({
    required: true,
  })
  content!: string;
}

export const TextPostModel = getModelForClass(TextPost);

TextPostModel.watch().on("change", async (data: any) => {
  // https://mongoosejs.com/docs/models.html#change-streams
  if (data.fullDocument) {
    // Insert operation
    const user = await UserModel.findById(
      data.fullDocument.author.toString()
    ).populate({
      path: "machas",
      select: "_id",
    });
    let machas = user!.machas?.flatMap((macha) => (macha as any)._id);
    if (!machas) {
      return;
    }
    for (let macha of machas) {
      let notification = {
        content: `${user!.name} created a new post \"${
          data.fullDocument.content
        }\"`,
        user: macha,
        uri: `https://macha.in/text/${data.fullDocument.uri}`,
      };

      await NotificationModel.create(notification);
    }
  }
});
