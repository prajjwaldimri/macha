import { queryType, stringArg } from "nexus";

export const Query = queryType({
  definition(t) {
    t.field("user", {
      type: "User",
      args: {
        name: stringArg()
      }
    });
  }
});
