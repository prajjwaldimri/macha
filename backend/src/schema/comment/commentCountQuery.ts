import { queryField, stringArg } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { CommentModel } from "../../models/Comment";

export const getCommentCount = queryField("getCommentCount", {
  type: "Int",
  args: {
    postId: stringArg()
  },
  async resolve(_, { postId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot get the comment count without logging in"
        );
      }

      let comments = await CommentModel.find({ post: postId });

      return comments.length;
    } catch (err) {
      return err;
    }
  }
});
