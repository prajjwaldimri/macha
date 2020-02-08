import { mutationField, idArg } from "nexus";
import { UserContext } from "../types";

export const likePost = mutationField("likePost", {
  type: "Like",
  args: {
    postId: idArg({ required: true })
  },
  async resolve(_, {}, ctx: UserContext) {}
});
