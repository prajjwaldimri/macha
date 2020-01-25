import { mutationType, stringArg } from "nexus";

import { UserModel } from "../models/User";

export const Mutation = mutationType({
  definition(t) {
    t.field("createUser", {
      type: "User",
      args: {
        username: stringArg({ required: true }),
        email: stringArg({ required: true })
      },
      async resolve(_, { username, email }): Promise<any> {
        return await UserModel.create({
          username: username,
          email: email
        });
      }
    });
  }
});
