import { stringArg, mutationField } from "nexus";
import { UserModel } from "../../models/User";

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
    return await UserModel.create({ username, password });
  }
});
