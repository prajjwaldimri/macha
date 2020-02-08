import { objectType } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.implements("Node");
    t.string("username", { nullable: false });
    t.string("email");
    t.string("name", { nullable: false });
    t.string("age", {
      nullable: true
    });
    t.id("authToken");
  }
});
