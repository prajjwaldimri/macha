import { prop, getModelForClass } from "@typegoose/typegoose";

class User {
  @prop({ required: true, unique: true })
  username!: string;

  @prop({ required: true })
  password!: string;
}

export const UserModel = getModelForClass(User);
