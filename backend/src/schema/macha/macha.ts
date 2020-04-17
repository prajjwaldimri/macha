import { objectType } from "@nexus/schema";
import { UserModel } from "../../models/User";

export const Machas = objectType({
  name: "Machas",
  definition(t) {
    t.list.field("machas", {
      type: "User",
    });
  },
});
