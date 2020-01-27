import { stringArg, mutationField } from "nexus";

export const loginUser = mutationField("login", {
  type: "User",
  args: {}
});
