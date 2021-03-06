import {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} from "apollo-server";
import { stringArg, mutationField, intArg } from "@nexus/schema";
import { VideoPostModel } from "../../models/VideoPost";
import isLatLong from "validator/lib/isLatLong";
import { UserContext } from "../types";

export const createVideoPost = mutationField("createVideoPost", {
  type: "VideoPost",
  args: {
    location: stringArg(),
    caption: stringArg(),
    video: stringArg({ required: true }),
  },
  async resolve(
    _,
    { location, caption, video },
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

      return await VideoPostModel.create({
        author: ctx.user._id,
        video,
        caption,
        location,
      });
    } catch (err) {
      return err;
    }
  },
});

export const updateVideoPost = mutationField("updateVideoPost", {
  type: "VideoPost",
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

      const videoPost = await VideoPostModel.findOne({ uri });

      if (!videoPost) {
        throw new UserInputError("uri doesn't exist");
      }

      if (videoPost.author.toString() !== ctx.user._id.toString()) {
        throw new ForbiddenError(
          "Not allowed to update the post as the logged in user is not the author of the post"
        );
      }

      return await VideoPostModel.findOneAndUpdate(
        { uri },
        {
          location,
          caption,
        },
        { new: true }
      );
    } catch (err) {
      return err;
    }
  },
});

export const deleteVideoPost = mutationField("deleteVideoPost", {
  type: "VideoPost",
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

      const videoPost = await VideoPostModel.findOne({ uri });

      if (!videoPost) {
        throw new UserInputError("uri doesn't exist");
      }

      if (videoPost.author.toString() !== ctx.user._id.toString()) {
        throw new ForbiddenError(
          "Not allowed to delete the post as the logged in user is not the author of the post"
        );
      }

      return await videoPost.remove();
    } catch (err) {
      return err;
    }
  },
});
