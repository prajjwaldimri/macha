import { objectType } from "@nexus/schema";
import { UserModel } from "../../models/User";
import { LikeModel } from "../../models/Like";
import { CommentModel } from "../../models/Comment";

export const TextPost = objectType({
  name: "TextPost",
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
    t.field("isCurrentUserAuthor", {
      type: "Boolean",
      async resolve(root, args, ctx, info): Promise<any> {
        return root.author.toString() === ctx.user._id.toString();
      },
    });
    t.field("hasCurrentUserLikedTextPost", {
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
    t.string("uri", { nullable: false });
    t.string("content", { nullable: false });
  },
});

export const TextPostList = objectType({
  name: "TextPostList",
  definition(t) {
    t.list.field("textPosts", { type: "TextPost" });
  },
});
