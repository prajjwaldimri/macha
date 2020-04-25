import {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} from "apollo-server";
import { stringArg, mutationField, intArg } from "@nexus/schema";
import { UserContext } from "../types";
import { FeedbackModel } from "../../models/Feedback";

export const postFeedback = mutationField("postFeedback", {
  type: "Feedback",
  args: {
    log: stringArg({ required: true }),
    message: stringArg({ required: true }),
  },
  async resolve(_, { log, message }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check image post without logging in"
        );
      }

      return await FeedbackModel.create({
        author: ctx.user._id,
        log,
        message,
      });
    } catch (err) {
      return err;
    }
  },
});
