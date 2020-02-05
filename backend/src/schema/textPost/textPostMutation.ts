import {
  UserInputError,
  AuthenticationError,
  ForbiddenError
} from "apollo-server";
import { stringArg, mutationField, intArg } from "nexus";
import { TextPostModel } from "../../models/TextPost";
import isLength from "validator/lib/isLength";

export const createTextPost = mutationField("createTextPost", {
  type: "TextPost",
  args: {
    uri: stringArg({ required: true }),
    content: stringArg({ required: true })
  },
  async resolve(_, { uri, content }, ctx): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot create a post without logging in"
        );
      }

      if (await TextPostModel.findOne({ uri })) {
        throw new UserInputError("uri already exists");
      }

      if (!isLength(content.trim(), { min: 1 })) {
        throw new UserInputError("content should not be empty");
      }

      return await TextPostModel.create({
        author: ctx.user._id,
        uri,
        content
      });
    } catch (err) {
      return err;
    }
  }
});

export const updateTextPost = mutationField("updateTextPost", {
  type: "TextPost",
  args: {
    uri: stringArg({ required: true }),
    content: stringArg({ required: true })
  },
  async resolve(_, { uri, content }, ctx): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot update a post without logging in"
        );
      }

      const textPost = await TextPostModel.findOne({ uri });

      if (!textPost) {
        throw new UserInputError("uri doesn't exist");
      }

      if (textPost.author.toString() !== ctx.user._id.toString()) {
        throw new ForbiddenError(
          "Not allowed to update the post as the logged in user is not the author of the post"
        );
      }

      if (!isLength(content.trim(), { min: 1 })) {
        throw new UserInputError("content should not be empty");
      }

      return await TextPostModel.findOneAndUpdate(
        { uri },
        {
          content
        },
        { new: true }
      );
    } catch (err) {
      return err;
    }
  }
});
