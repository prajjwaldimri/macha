import { objectType } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.implements("Node");
    t.string("username");
    t.string("email");
  }
});
