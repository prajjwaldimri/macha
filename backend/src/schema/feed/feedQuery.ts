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
    limit: intArg({ default: 25, description: "Cannot be less than 25" }),
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
      let machas = user!.machas?.flatMap((macha) => (macha as any)._id);
      machas?.push(ctx.user._id);

      // Get their latest posts
      if (!machas) {
        return { posts: null };
      }

      let posts: Array<any> = [];
      let postsType: Array<any> = [];
      for (const macha of machas) {
        const textPosts = await TextPostModel.find({
          author: macha,
        })
          .skip(skip!)
          .limit(limit!)
          .select("_id, updatedAt")
          .exec();
        for (const textPost of textPosts) {
          postsType.push("TextPost");
        }
        const imagePosts = await ImagePostModel.find({ author: macha })
          .skip(skip!)
          .limit(limit!)
          .select("_id, updatedAt")
          .exec();
        for (const imagePost of imagePosts) {
          postsType.push("ImagePost");
        }
        const videoPosts = await VideoPostModel.find({ author: macha })
          .skip(skip!)
          .limit(limit!)
          .select("_id, updatedAt")
          .exec();
        for (const videoPost of videoPosts) {
          postsType.push("ImagePost");
        }
        posts.push(...textPosts, ...imagePosts, ...videoPosts);
      }

      // Arrange them in chronological order in three steps
      //1. First merge posts and postsType arrays
      const mergedArray = [];
      for (let i = 0; i < posts.length; i++) {
        mergedArray.push({ post: posts[i], type: postsType[i] });
      }

      //2. Sort merged Array
      mergedArray.sort((first, second): any => {
        const firstDate = Date.parse(first.post.updatedAt);
        const secondDate = Date.parse(second.post.updatedAt);
        if (firstDate > secondDate) {
          return 1;
        } else if (firstDate < secondDate) {
          return -1;
        }
        return 0;
      });

      //3. Separate arrays
      let sortedPosts: any = [];
      for (let i = 0; i < posts.length; i++) {
        sortedPosts[i] = mergedArray[i].post;
        postsType[i] = mergedArray[i].type;
      }

      // Only keep the top #(limit) posts
      if (sortedPosts.length > limit!) {
        sortedPosts = sortedPosts.slice(0, limit! - 1);
        postsType = postsType.slice(0, limit! - 1);
      }

      // Only return the _ids and type of the post
      posts = [];
      for (const post of sortedPosts) {
        posts.push(post._id.toString());
      }

      return { posts, postsType };
    } catch (err) {
      return err;
    }
  },
});
