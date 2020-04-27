import {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} from "apollo-server";
import { stringArg, mutationField, intArg } from "@nexus/schema";

import { uploadSingleImageBase64Encoded } from "../../cloudinary/imageUpload";
import { ImagePostModel } from "../../models/ImagePost";
import isLatLong from "validator/lib/isLatLong";
import { UserContext } from "../types";
import { deleteSingleImage } from "../../cloudinary/imageDelete";

export const createImagePost = mutationField("createImagePost", {
  type: "ImagePost",
  args: {
    location: stringArg(),
    caption: stringArg(),
    image: stringArg({ required: true }),
  },
  async resolve(
    _,
    { location, caption, image },
    ctx: UserContext
  ): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot create a post without logging in"
        );
      }

      if (location && !isLatLong(location)) {
        throw new UserInputError("location is not in latitude,longitude form");
      }

      return await ImagePostModel.create({
        author: ctx.user._id,
        image,
        location,
        caption,
      });
    } catch (err) {
      return err;
    }
  },
});

export const createImagePostBase64 = mutationField("createImagePostBase64", {
  type: "ImagePost",
  args: {
    file: stringArg({ required: true }),
    caption: stringArg(),
  },
  async resolve(_, { file, caption }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot update a post without logging in"
        );
      }

      const result: any = await uploadSingleImageBase64Encoded(file);
      return await ImagePostModel.create({
        author: ctx.user._id,
        image: result.url,
        caption,
      });
    } catch (err) {
      console.log(err);
      return err;
    }
  },
});

export const updateImagePost = mutationField("updateImagePost", {
  type: "ImagePost",
  args: {
    uri: stringArg({ required: true }),
    location: stringArg(),
    caption: stringArg(),
  },
  async resolve(_, { uri, location, caption }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot update a post without logging in"
        );
      }

      const imagePost = await ImagePostModel.findOne({ uri });

      if (!imagePost) {
        throw new UserInputError("uri doesn't exist");
      }

      if (imagePost.author.toString() !== ctx.user._id.toString()) {
        throw new ForbiddenError(
          "Not allowed to update the post as the logged in user is not the author of the post"
        );
      }

      return await ImagePostModel.findOneAndUpdate(
        { uri },
        {
          location: location || undefined,
          caption: caption || undefined,
        },
        { new: true }
      );
    } catch (err) {
      return err;
    }
  },
});

export const deleteImagePost = mutationField("deleteImagePost", {
  type: "ImagePost",
  args: {
    uri: stringArg({ required: true }),
  },
  async resolve(_, { uri }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot delete a post without logging in"
        );
      }

      const imagePost = await ImagePostModel.findOne({ uri });

      if (!imagePost) {
        throw new UserInputError("uri doesn't exist");
      }

      if (imagePost.author.toString() !== ctx.user._id.toString()) {
        throw new ForbiddenError(
          "Not allowed to delete the post as the logged in user is not the author of the post"
        );
      }

      await deleteSingleImage(imagePost.image);
      return await imagePost.remove();
    } catch (err) {
      return err;
    }
  },
});
