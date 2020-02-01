import { prop, getModelForClass } from "@typegoose/typegoose";

class ImagePost {
  @prop({
    required: true,
    unique: true,
    ref: ""
  })
  author!: string;

  @prop({
    required: true,
    unique: true
  })
  uri!: string;
}
