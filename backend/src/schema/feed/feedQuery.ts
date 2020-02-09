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
    limit: intArg({ default: 150, description: "Cannot be less than 150" })
  },
  async resolve(_, { skip, limit }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot like without logging in");
      }

      // Get a user's machas
      const user = await UserModel.findById(ctx.user._id).populate({
        path: "machas",
        select: "_id"
      });
      const machas = user!.machas;

      // Get their latest posts
      if (!machas) {
        return { posts: null };
      }

      let posts: Array<Array<any>> = [];
      machas.forEach(async macha => {
        posts.push(
          await TextPostModel.find({ author: macha }).select("_id, updatedAt")
        );
        posts.push(
          await ImagePostModel.find({ author: macha }).select("_id, updatedAt")
        );
        posts.push(
          await VideoPostModel.find({ author: macha }).select("_id, updatedAt")
        );
      });

      console.log(posts);

      // Arrange them in chronological order
    } catch (err) {
      return err;
    }
  }
});
