import { mutationField, stringArg, intArg } from "nexus";
import { UserContext } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server";
import { OneTimeCodeModel } from "../../models/OneTimeCode";
import isInt from "validator/lib/isInt";
import { UserModel } from "../../models/User";

export const generateMachaOTC = mutationField("generateMachaOTC", {
  type: "String",
  args: {
    userCount: intArg({ required: true, default: 1 })
  },
  async resolve(_, { userCount }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot add a macha without logging in");
      }

      if (!isInt(userCount.toString(), { min: 1, max: 10 })) {
        throw new UserInputError("User Count should be between 1 and 10");
      }

      const otc = await OneTimeCodeModel.create({
        userCount,
        author: ctx.user._id
      });

      return otc._id.toString();
    } catch (err) {
      return err;
    }
  }
});

export const addMacha = mutationField("addMacha", {
  type: "User",
  args: {
    oneTimeCode: stringArg({ required: true })
  },
  async resolve(_, { oneTimeCode }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot add a macha without logging in");
      }

      let otc = await OneTimeCodeModel.findById(oneTimeCode);
      if (!otc) {
        throw new UserInputError("Code expired or never existed");
      }

      if (otc.author.toString() === ctx.user._id.toString()) {
        throw new UserInputError("Cannot add yourself as your friend :(");
      }

      if (otc.userCount <= 1) {
        await OneTimeCodeModel.findByIdAndDelete(otc._id);
      }

      await UserModel.findByIdAndUpdate(otc.author, {
        $push: { machas: ctx.user._id }
      }).select("_id");

      return await UserModel.findByIdAndUpdate(
        ctx.user._id,
        {
          $push: { machas: otc.author }
        },
        { new: true }
      );
    } catch (err) {
      return err;
    }
  }
});

export const removeMacha = mutationField("removeMacha", {
  type: "User",
  args: {
    username: stringArg({
      required: true,
      description: "Username of the user to be removed"
    })
  },
  async resolve(_, { username }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot add a macha without logging in");
      }

      const userToBeRemoved = await UserModel.findOne({ username });
      if (!userToBeRemoved) {
        throw new UserInputError(
          "user with the provided username doesn't exist"
        );
      }

      if (userToBeRemoved._id.toString() === ctx.user._id.toString()) {
        throw new UserInputError("Cannot remove yourself as your friend :(");
      }

      await UserModel.findByIdAndUpdate(userToBeRemoved._id, {
        $pull: { machas: ctx.user._id }
      }).select("_id");

      return await UserModel.findByIdAndUpdate(
        ctx.user._id,
        {
          $push: { machas: userToBeRemoved._id }
        },
        { new: true }
      );
    } catch (err) {
      return err;
    }
  }
});
