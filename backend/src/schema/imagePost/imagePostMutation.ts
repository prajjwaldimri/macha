import { UserInputError, AuthenticationError } from "apollo-server";
import { stringArg, mutationField, intArg } from "nexus";
import { ImagePostModel } from "../../models/ImagePost";
import isLatLong from "validator/lib/isLatLong";

export const createImagePost = mutationField("createImagePost", {
  type: "ImagePost",
  args: {
    uri: stringArg({ required: true }),
    location: stringArg(),
    caption: stringArg(),
    image: stringArg({ required: true })
  },
  async resolve(_, { uri, location, caption, image }, ctx): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Cannot create a post without logging in"
        );
      }

      if (await ImagePostModel.findOne({ uri })) {
        throw new UserInputError("uri already exists");
      }

      if (location && !isLatLong(location)) {
        throw new UserInputError("location is not in latitude,longitude form");
      }

      return await ImagePostModel.create({
        author: ctx.user._id,
        uri,
        image,
        location,
        caption
      });
    } catch (err) {
      return err;
    }
  }
});
