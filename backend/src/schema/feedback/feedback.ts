import { objectType } from "@nexus/schema";
import { UserModel } from "../../models/User";

export const Feedback = objectType({
  name: "Feedback",
  definition(t) {
    t.implements("Node");
    t.implements("Timestamp");
    t.id("author", { nullable: false });
    t.field("authorDetails", {
      type: "User",
      async resolve(root): Promise<any> {
        return await UserModel.findById(root.author).select("-password -age");
      },
    });
    t.string("uri", { nullable: false });
    t.string("message", { nullable: false });
    t.string("log", { nullable: false });
  },
});
