import { queryField, stringArg, intArg } from "@nexus/schema";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { FeedbackModel } from "../../models/Feedback";
import isMongoId from "validator/lib/isMongoId";

export const getFeedback = queryField("getFeedback", {
  type: "Feedback",
  args: {
    identifier: stringArg({
      description: "Can be postId or uri",
      required: true,
    }),
  },
  async resolve(_, { identifier }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check image post without logging in"
        );
      }

      let feedback = await FeedbackModel.findOne({ uri: identifier });

      if (!feedback && isMongoId(identifier)) {
        feedback = await FeedbackModel.findById(identifier);
      }

      if (!feedback) {
        throw new UserInputError("Given feedback id or uri doesn't exist");
      }

      return feedback;
    } catch (err) {
      return err;
    }
  },
});
