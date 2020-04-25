import { queryField, intArg, stringArg } from "@nexus/schema";
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server";
import { UserModel } from "../../models/User";
import { UserContext } from "../types";
import { TextPostModel } from "../../models/TextPost";
import { VideoPostModel } from "../../models/VideoPost";
import { ImagePostModel } from "../../models/ImagePost";

export const getFeed = queryField("getFeed", {
  type: "Feed",
  args: {
    textPostSkip: intArg({ default: 0 }),
    imagePostSkip: intArg({ default: 0 }),
    videoPostSkip: intArg({ default: 0 }),
    limit: intArg({ default: 10 }),
  },
  async resolve(
    _,
    { textPostSkip, imagePostSkip, videoPostSkip, limit },
    ctx: UserContext
  ): Promise<any> {
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
          .skip(textPostSkip!)
          .limit(limit!)
          .select("_id, updatedAt")
          .sort("-updatedAt")
          .exec();
        for (const textPost of textPosts) {
          postsType.push("TextPost");
        }
        const imagePosts = await ImagePostModel.find({ author: macha })
          .skip(imagePostSkip!)
          .limit(limit!)
          .select("_id, updatedAt")
          .sort("-updatedAt")
          .exec();
        for (const imagePost of imagePosts) {
          postsType.push("ImagePost");
        }
        const videoPosts = await VideoPostModel.find({ author: macha })
          .skip(videoPostSkip!)
          .limit(limit!)
          .select("_id, updatedAt")
          .sort("-updatedAt")
          .exec();
        for (const videoPost of videoPosts) {
          postsType.push("VideoPost");
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
      for (
        let i = posts.length - 1, j = 0;
        i >= 0 && j < posts.length;
        i--, j++
      ) {
        sortedPosts[j] = mergedArray[i].post;
        postsType[j] = mergedArray[i].type;
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

export const getFeedOfOneUser = queryField("getFeedOfOneUser", {
  type: "Feed",
  args: {
    textPostSkip: intArg({ default: 0 }),
    imagePostSkip: intArg({ default: 0 }),
    videoPostSkip: intArg({ default: 0 }),
    limit: intArg({ default: 10 }),
    username: stringArg({ required: true }),
  },
  async resolve(
    _,
    { textPostSkip, imagePostSkip, videoPostSkip, limit, username },
    ctx: UserContext
  ): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot check feed without logging in");
      }

      const user = await UserModel.findOne({ username }).populate({
        path: "machas",
        select: "_id",
      });

      if (!user) {
        throw new UserInputError("No user with the provided id exists");
      }

      // Check if the current user is macha of the other user.
      let machas = user.machas?.flatMap((macha) => (macha as any)._id);
      machas?.push(ctx.user._id);
      if (machas!.indexOf(ctx.user._id) < 0) {
        throw new ForbiddenError("You are not allowed to access this resource");
      }

      // Get all the posts from the user
      let posts: Array<any> = [];
      let postsType: Array<any> = [];
      const textPosts = await TextPostModel.find({
        author: user._id,
      })
        .skip(textPostSkip!)
        .limit(limit!)
        .select("_id, updatedAt")
        .sort("-updatedAt")
        .exec();
      for (const textPost of textPosts) {
        posts.push(textPost);
        postsType.push("TextPost");
      }
      const imagePosts = await ImagePostModel.find({ author: user._id })
        .skip(imagePostSkip!)
        .limit(limit!)
        .select("_id, updatedAt")
        .sort("-updatedAt")
        .exec();
      for (const imagePost of imagePosts) {
        posts.push(imagePost);
        postsType.push("ImagePost");
      }
      const videoPosts = await VideoPostModel.find({ author: user._id })
        .skip(videoPostSkip!)
        .limit(limit!)
        .select("_id, updatedAt")
        .sort("-updatedAt")
        .exec();
      for (const videoPost of videoPosts) {
        posts.push(videoPost);
        postsType.push("VideoPost");
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
      for (
        let i = posts.length - 1, j = 0;
        i >= 0 && j < posts.length;
        i--, j++
      ) {
        sortedPosts[j] = mergedArray[i].post;
        postsType[j] = mergedArray[i].type;
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
