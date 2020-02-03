import { prop, getModelForClass } from "@typegoose/typegoose";

export class User {
  @prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true,
    minlength: 3
  })
  username!: string;

  @prop({ required: true })
  password!: string;
}

export const UserModel = getModelForClass(User);
