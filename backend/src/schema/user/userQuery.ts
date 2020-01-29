import { stringArg, queryField } from "nexus";

export const me = queryField("me", {
  type: "User",
  async resolve(parent, _, ctx): Promise<any> {
    return ctx;
  }
});
