import { queryType, stringArg } from "nexus";
import { UserModel } from "../models/User";

export const Query = queryType({
  definition(t) {
    t.field("hello", {
      type: "String",
      resolve: () => {
        return "World";
      }
    });
    t.field("getUser", {
      type: "User",
      args: { id: stringArg({ required: true }) },
      async resolve(_, { id }): Promise<any> {
        return await UserModel.findById(id);
      }
    });
  }
});
