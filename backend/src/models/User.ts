import { prop, getModelForClass, Ref, arrayProp } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

export class User extends TimeStamps {
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

  @prop({
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true
  })
  email!: string;

  @prop({ required: true })
  name?: string;

  @prop({
    required: true,
    default: 13
  })
  age!: number;

  @arrayProp({
    itemsRef: "User"
  })
  machas?: Ref<User>[];
}

export const UserModel = getModelForClass(User);
