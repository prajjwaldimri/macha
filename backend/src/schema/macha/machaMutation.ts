import { UserInputError, AuthenticationError } from "apollo-server";
import { stringArg, mutationField, intArg } from "nexus";

import { UserModel } from "../../models/User";
import { UserContext } from "../types";

export const addMacha = mutationField("addmacha", {
  type: "Boolean",
  args: {
    uniqueMachaId: stringArg({ required: true })
  },
  async resolve(_, { uniqueMachaId }, ctx: UserContext): Promise<any> {
    try {
      if (!ctx.user) {
        throw new AuthenticationError("Cannot add macha without logging in");
      }

      const loggedInUser = await UserModel.findOne({ _id: ctx.user._id });
      const userToBeAdded = await UserModel.findOne({ uniqueMachaId });

      if (loggedInUser?.uniqueMachaId === uniqueMachaId) {
        throw new UserInputError("Cannot add yourself as macha");
      }

      if (!userToBeAdded) {
        throw new UserInputError("Invalid unique macha id");
      }

      if (loggedInUser?.machas?.indexOf(userToBeAdded._id)! >= 0) {
        throw new UserInputError("Macha already exists in macha list");
      }

      await UserModel.findByIdAndUpdate(loggedInUser?._id, {
        $push: { machas: userToBeAdded._id }
      });
      await UserModel.findByIdAndUpdate(userToBeAdded._id, {
        $push: { machas: loggedInUser?._id }
      });

      return true;
    } catch (err) {
      return err;
    }
  }
});
