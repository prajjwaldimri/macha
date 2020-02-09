import { queryField, intArg } from "nexus";
import { AuthenticationError } from "apollo-server";
import { UserModel } from "../../models/User";
import { UserContext } from "../types";

export const getFeed = queryField("getFeed", {
  type: "Feed",
  args: {
    skip: intArg({ default: 0 }),
    limit: intArg({ default: 50, description: "Cannot be less than 50" })
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

      const machasCount = machas?.length;
      const numberOfPostsPerMacha = Math.ceil(limit / machasCount);

      let posts = [];
      machas.forEach(async macha => {});

      // Arrange them in chronological order
    } catch (err) {
      return err;
    }
  }
});
