import { queryField, intArg } from "nexus";
import { AuthenticationError } from "apollo-server";
import { UserModel } from "../../models/User";
import { UserContext } from "../types";
import { TextPostModel } from "../../models/TextPost";
import { VideoPostModel } from "../../models/VideoPost";
import { ImagePostModel } from "../../models/ImagePost";

export const getFeed = queryField("getFeed", {
  type: "Feed",
  args: {
    skip: intArg({ default: 0 }),
    limit: intArg({ default: 150, description: "Cannot be less than 150" }),
  },
  async resolve(_, { skip, limit }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot check feed without logging in");
      }

      // Get a user's machas
      const user = await UserModel.findById(ctx.user._id).populate({
        path: "machas",
        select: "_id",
      });
      let machas = user!.machas?.flatMap((macha) => macha._id);
      machas?.push(ctx.user._id);

      // Get their latest posts
      if (!machas) {
        return { posts: null };
      }

      let posts: Array<any> = [];
      for (const macha of machas) {
        const textPosts = await TextPostModel.find({ author: macha }).select(
          "_id, updatedAt"
        );
        const imagePosts = await ImagePostModel.find({ author: macha }).select(
          "_id, updatedAt"
        );
        const videoPosts = await VideoPostModel.find({ author: macha }).select(
          "_id, updatedAt"
        );
        posts.push(...textPosts, ...imagePosts, ...videoPosts);
      }

      // Arrange them in chronological order

      let sortedPosts = posts.sort((first, second): number => {
        const firstDate = Date.parse(first.updatedAt);
        const secondDate = Date.parse(second.updatedAt);
        if (firstDate > secondDate) {
          return 1;
        } else if (firstDate < secondDate) {
          return -1;
        }
        return 0;
      });

      // Only keep the top #(limit) posts
      if (sortedPosts.length > limit!) {
        sortedPosts = sortedPosts.slice(0, limit! - 1);
      }

      // Only return the _ids of the posts
      posts = [];
      for (const post of sortedPosts) {
        posts.push(post._id.toString());
      }

      return { posts };
    } catch (err) {
      return err;
    }
  },
});
