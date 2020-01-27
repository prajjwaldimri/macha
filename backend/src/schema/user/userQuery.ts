import { stringArg, queryField } from "nexus";

export const usersQueryField = queryField("user", {
  type: "String",
  resolve() {
    return "From inside";
  }
});
