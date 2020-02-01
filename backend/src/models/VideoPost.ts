import { prop, getModelForClass } from "@typegoose/typegoose";

class VideoPost {
  @prop({
    required: true,
    unique: true
  })
  author!: string;

  @prop({
    required: true,
    unique: true
  })
  uri!: string;
}
