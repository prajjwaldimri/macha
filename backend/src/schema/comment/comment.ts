import { objectType, enumType, unionType } from "nexus";
import { UserModel } from "../../models/User";
import { CommentModel } from "../../models/Comment";

export const PostTypeEnum = enumType({
  name: "PostTypeEnum",
  members: {
    ImagePost: "ImagePost",
    VideoPost: "VideoPost",
    TextPost: "TextPost",
  },
});

export const PostType = unionType({
  name: "PostType",
  description: "ImagePost / VideoPost / TextPost",
  definition(t) {
    t.members("ImagePost", "VideoPost", "TextPost");
    t.resolveType(() => null);
  },
});

export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.implements("Node");
    t.id("author", { nullable: false });
    t.field("authorDetails", {
      type: "User",
      async resolve(root): Promise<any> {
        return await UserModel.findById(root.author).select("-password -age");
      },
      nullable: false,
    });
    t.field("commentCount", {
      type: "Int",
      async resolve(root, args, ctx, info): Promise<any> {
        try {
          let comments = await CommentModel.find({
            post: root.id!,
          })
            .countDocuments({})
            .exec();
          return comments;
        } catch (err) {
          return err;
        }
      },
    });

    t.string("text", { nullable: false });
    t.field("postType", { type: "PostTypeEnum", nullable: false });
    t.id("post", { nullable: false });
  },
});
