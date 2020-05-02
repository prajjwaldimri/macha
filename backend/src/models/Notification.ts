import dotenv from "dotenv";
dotenv.config();
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import { User } from "./User";
import { Client } from "onesignal-node";

export class Notification extends TimeStamps {
  @prop({
    required: true,
    ref: "User",
  })
  user!: Ref<User>;

  @prop({
    required: true,
  })
  uri!: string;

  @prop({})
  image!: string;

  @prop({
    required: true,
  })
  content!: string;
}

export const NotificationModel = getModelForClass(Notification);

NotificationModel.watch().on("change", async (data) => {
  try {
    if (data.operationType === "insert") {
      const client = new Client(
        process.env.ONESIGNAL_APP_ID || "",
        process.env.ONESIGNAL_API_KEY || ""
      );

      await client.createNotification({
        contents: {
          en: data.fullDocument.content,
        },
        web_url: `https://macha.in/${data.fullDocument.uri}`,
        chrome_web_icon: data.fullDocument.image,
        include_external_user_ids: [data.fullDocument.user.toString()],
      });
    }
  } catch (err) {
    console.log(err);
  }
});
