import { objectType, enumType, unionType } from "@nexus/schema";
import { UserModel } from "../../models/User";
import { LikeModel } from "../../models/Like";

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
    t.field("isCurrentUserAuthor", {
      type: "Boolean",
      async resolve(root, args, ctx, info): Promise<any> {
        return root.author.toString() === ctx.user._id.toString();
      },
    });
    t.field("hasCurrentUserLikedComment", {
      type: "Boolean",
      async resolve(root, args, ctx, info): Promise<any> {
        try {
          let likes = await LikeModel.find({ likable: root.id! }).select(
            "author"
          );
          let flattenedLikes = likes.flatMap((el) => el.author.toString());
          return flattenedLikes.indexOf(ctx.user._id.toString()) >= 0;
        } catch (err) {
          return err;
        }
      },
    });
    t.field("likeCount", {
      type: "Int",
      async resolve(root, args, ctx, info): Promise<any> {
        try {
          let likes = await LikeModel.find({
            likable: root.id!,
          })
            .countDocuments({})
            .exec();
          return likes;
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

export const Comments = objectType({
  name: "Comments",
  definition(t) {
    t.list.field("comments", { type: "Comment" });
  },
});
