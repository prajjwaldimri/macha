import dotenv from "dotenv";

dotenv.config();
if (!process.env.MONGODB) {
  console.error(
    "ERROR - No .env file found. Please contact @prajjwaldimri for more info."
  );
}

const debug = require("debug")("dev");

import { ApolloServer, ApolloError } from "apollo-server";
import { makeSchema } from "nexus";
import mongoose from "mongoose";
import path from "path";
import * as jwt from "jsonwebtoken";

import * as allTypes from "./schema";
import { UserModel } from "./models/User";
import { CommentModel } from "./models/Comment";
import { TextPostModel } from "./models/TextPost";

const schema = makeSchema({
  types: allTypes,
  outputs: {
    schema: path.join(__dirname, "./generated/schema.graphql"),
    typegen: path.join(__dirname, "./generated/my-generated-types.d.ts")
  }
});

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    try {
      if (req.headers.authorization) {
        const token = req.headers.authorization.replace("Bearer ", "");
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) {
          throw new ApolloError("JWT token invalid");
        }
        return { user: user };
      }
    } catch (err) {
      return {};
    }
  }
});

mongoose
  .connect(process.env.MONGODB || "", { useNewUrlParser: true })
  .then(() => {
    server.listen().then(async ({ url }) => {
      debug(`🚀 Server ready at ${url}`);
      const post = await TextPostModel.create({
        author: "5e354de85354367aaeb76ded",
        uri: "yoyoy",
        content: "IOAUDIASYDIYASIs"
      });
      CommentModel.create({
        author: "5e354de85354367aaeb76ded",
        text: "Hello",
        postType: "VideoPost",
        post: post._id
      }).then(doc => {
        console.log(doc);
      });
    });
  })
  .catch(err => {
    debug(err);
  });
