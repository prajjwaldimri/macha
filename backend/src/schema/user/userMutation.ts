import isLength from "validator/lib/isLength";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  UserInputError,
  GraphQLUpload,
  AuthenticationError,
} from "apollo-server";
import {
  stringArg,
  mutationField,
  intArg,
  asNexusMethod,
  arg,
} from "@nexus/schema";
import matches from "validator/lib/matches";

import { uploadSingleImage } from "../../cloudinary/imageUpload";

import { UserModel } from "../../models/User";
import { UserContext } from "../types";

export const loginUser = mutationField("login", {
  type: "String",
  args: {
    username: stringArg({ required: true }),
    password: stringArg({ required: true }),
  },
  async resolve(_, { username, password }): Promise<any> {
    try {
      if (!isLength(username.trim(), { min: 3 })) {
        throw new UserInputError("Username is too short");
      }

      const user = await UserModel.findOne({ username });
      if (!user) {
        throw new UserInputError("Username/Password is invalid!");
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new UserInputError("Username/Password is invalid!");
      }
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "15d",
      });
    } catch (err) {
      return err;
    }
  },
});

export const signUpUser = mutationField("signup", {
  type: "String",
  args: {
    username: stringArg({ required: true }),
    password: stringArg({ required: true }),
    name: stringArg({ required: true }),
    email: stringArg(),
    age: intArg({ default: 13 }),
  },
  async resolve(_, { username, password, email, name, age }): Promise<any> {
    try {
      if (!isLength(username.trim(), { min: 3 })) {
        throw new UserInputError("Username is too short");
      }

      if (await UserModel.findOne({ username })) {
        throw new UserInputError("Username is already is use");
      }

      const createdUser = await UserModel.create({
        username,
        password: await bcrypt.hash(password, 10),
        email,
        name,
        age,
      });

      return jwt.sign({ id: createdUser._id }, process.env.JWT_SECRET!, {
        expiresIn: "15d",
      });
    } catch (err) {
      return err;
    }
  },
});

export const updateUser = mutationField("updateUser", {
  type: "User",
  args: {
    name: stringArg({ required: true }),
    age: intArg({ default: 13, required: true }),
  },
  async resolve(_, { name, age }, ctx: UserContext): Promise<any> {
    try {
      if (age < 13 || age > 99) {
        throw new UserInputError("Age can only be between 13 and 99");
      }
      return await UserModel.findByIdAndUpdate(ctx.user?._id, {
        name,
        age,
      });
    } catch (err) {
      return err;
    }
  },
});

// https://github.com/graphql-nexus/schema/issues/128
export const Upload = asNexusMethod(GraphQLUpload!, "upload");

export const changeProfilePicture = mutationField("changeProfilePicture", {
  type: "Boolean",
  args: {
    file: arg({ type: "Upload" }),
  },
  async resolve(_, { file }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot change profile picture without logging in"
        );
      }
      const { mimetype, createReadStream } = await file;

      if (matches(mimetype, new RegExp("image/*"))) {
        const result: any = await uploadSingleImage(createReadStream());

        const user = await UserModel.findOne({ _id: ctx.user._id });
        user!.profileImage = result.url;
        await user!.save();

        return true;
      }
      return false;
    } catch (err) {
      return err;
    }
  },
});
