import { queryType, stringArg } from "nexus";

export const Query = queryType({
  definition(t) {
    t.field("user", {
      type: "User",
      args: {
        name: stringArg()
      }
    });
    t.field("inputname", {
      type: "String",
      args: {
        input: stringArg({ required: true })
      },
      resolve: (parent, { input }, ctx) => {
        return input;
      }
    });
  }
});
