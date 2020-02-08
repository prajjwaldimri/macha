import { objectType, enumType, unionType } from "nexus";
import { UserModel } from "../../models/User";

export const LikableTypeEnum = enumType({
  name: "LikableTypeEnum",
  members: {
    ImagePost: "ImagePost",
    VideoPost: "VideoPost",
    TextPost: "TextPost",
    Comment: "Comment"
  }
});

export const LikableType = unionType({
  name: "LikableType",
  description: "ImagePost / VideoPost / TextPost / Comment",
  definition(t) {
    t.members("ImagePost", "VideoPost", "TextPost", "Comment");
    t.resolveType(() => null);
  }
});

export const Like = objectType({
  name: "Like",
  definition(t) {
    t.implements("Node");
    t.id("author", { nullable: false });
    t.field("authorDetails", {
      type: "User",
      async resolve(root): Promise<any> {
        return await UserModel.findById(root.author).select("-password -age");
      }
    });
    t.field("likableType", { type: "LikableTypeEnum", nullable: false });
    t.id("likable", { nullable: false });
  }
});
