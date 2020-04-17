import { objectType } from "@nexus/schema";
import { UserModel } from "../../models/User";

export const VideoPost = objectType({
  name: "VideoPost",
  definition(t) {
    t.implements("Node");
    t.id("author", { nullable: false });
    t.field("authorDetails", {
      type: "User",
      async resolve(root): Promise<any> {
        return await UserModel.findById(root.author).select("-password -age");
      },
    });
    t.string("uri", { nullable: false });
    t.string("video", { nullable: false });
    t.string("location", { nullable: true });
    t.string("caption", { nullable: true });
  },
});
