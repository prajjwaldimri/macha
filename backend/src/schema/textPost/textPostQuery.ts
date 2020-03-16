import { queryField, stringArg } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { TextPostModel } from "../../models/TextPost";
import isMongoId from "validator/lib/isMongoId";

export const geTextPost = queryField("getTextPost", {
  type: "TextPost",
  args: {
    identifier: stringArg({
      description: "Can be postId or uri",
      required: true
    })
  },
  async resolve(_, { identifier }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot check the text post without logging in"
        );
      }

      let textPost = await TextPostModel.findOne({ uri: identifier });

      if (!textPost && isMongoId(identifier!)) {
        textPost = await TextPostModel.findById(identifier);
      }

      if (!textPost) {
        throw new UserInputError("Given post id or uri doesn't exist");
      }

      return textPost;
    } catch (err) {
      return err;
    }
  }
});
