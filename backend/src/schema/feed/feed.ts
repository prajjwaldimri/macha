import { objectType, enumType, unionType } from "@nexus/schema";

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.list.string("posts");
    t.list.string("postsType");
  },
});
