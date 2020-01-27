import { stringArg, mutationField } from "nexus";

export const loginUser = mutationField("login", {
  type: "User",
  args: {
    username: stringArg({ required: true }),
    password: stringArg({ required: true })
  },
  async resolve(_, { username, password }) {}
});
