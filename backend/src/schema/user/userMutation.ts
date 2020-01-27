import { stringArg, mutationField } from "nexus";
import { UserModel } from "../../models/User";
import { UserInputError } from "apollo-server";
import isLength from "validator/lib/isLength";
import bcrypt from "bcrypt";

export const loginUser = mutationField("login", {
  type: "User",
  args: {
    username: stringArg({ required: true }),
    password: stringArg({ required: true })
  },
  async resolve(_, { username, password }): Promise<any> {}
});

export const signUpUser = mutationField("signup", {
  type: "User",
  args: {
    username: stringArg({ required: true }),
    password: stringArg({ required: true })
  },
  async resolve(_, { username, password }): Promise<any> {
    try {
      if (!isLength(username.trim(), { min: 3 })) {
        throw new UserInputError("Username is too short");
      }

      if (await UserModel.findOne({ username })) {
        throw new UserInputError("Username is already is use");
      }

      return await UserModel.create({
        username,
        password: await bcrypt.hash(password, 10)
      });
    } catch (err) {
      return err;
    }
  }
});
