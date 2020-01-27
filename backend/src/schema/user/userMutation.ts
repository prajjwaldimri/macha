import { stringArg, mutationField } from "nexus";
import { UserModel } from "../../models/User";
import { User } from "./user";
export const loginUser = mutationField("login", {
  type: "User",
  args: {}
});

export const signUpUser = mutationField("signup", {
  type: "User",
  args: {
    username: stringArg({ required: true }),
    password: stringArg({ required: true })
  },
  async resolve(_, { username, password }) {
    return await UserModel.create({ username, password });
  }
});
