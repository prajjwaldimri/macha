import { queryType, stringArg } from "nexus";

export const Query = queryType({
  definition(t) {
    t.field("hello", {
      type: "String",
      resolve: () => {
        return "World";
      }
    });
  }
});
