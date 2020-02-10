import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop, getModelForClass, Ref } from "@typegoose/typegoose";

import { User } from "./User";

export class OneTimeCode extends TimeStamps {
  @prop({ required: true, default: 1, min: 1, max: 10 })
  userCount!: number;

  @prop({
    required: true,
    ref: "User"
  })
  author!: Ref<User>;
}

export const OneTimeCodeModel = getModelForClass(OneTimeCode);
