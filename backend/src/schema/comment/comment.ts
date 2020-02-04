import { objectType, enumType, unionType } from "nexus";

export const PostTypeEnum = enumType({
  name: "PostTypeEnum",
  members: {
    ImagePost: "ImagePost",
    VideoPost: "VideoPost",
    TextPost: "TextPost"
  }
});

const PostType = unionType({
  name: "PostType",
  description: "ImagePost / VideoPost/ TextPost",
  definition(t) {
    t.members("ImagePost", "VideoPost", "TextPost");
  }
});

export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.implements("Node");
    t.string("text", { nullable: false });
    t.field("postType", { type: "PostTypeEnum", nullable: false });
    t.id("post", { nullable: false });
  }
});
