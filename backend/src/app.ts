import dotenv from "dotenv";

dotenv.config();
if (!process.env.MONGODB) {
  console.error(
    "ERROR - No .env file found. Please contact @prajjwaldimri for more info."
  );
}

const debug = require("debug")("dev");

import { ApolloServer, ApolloError, PubSub } from "apollo-server";
import { makeSchema } from "@nexus/schema";
import mongoose from "mongoose";
import path from "path";
import * as jwt from "jsonwebtoken";

import * as allTypes from "./schema";
import { UserModel } from "./models/User";

const schema = makeSchema({
  types: allTypes,
  outputs: {
    schema: path.join(__dirname, "./generated/schema.graphql"),
    typegen: path.join(__dirname, "./generated/my-generated-types.d.ts"),
  },
});

const pubsub = new PubSub();

const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    try {
      let token = "";
      if (connection) {
        token = connection.context.authorization.replace("Bearer ", "");
      } else if (req && req.headers.authorization) {
        token = req.headers.authorization.replace("Bearer ", "");
      }
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await UserModel.findById(decoded.id).select("-password");
      if (!user) {
        throw new ApolloError("JWT token invalid");
      }
      return { user: user, pubsub };
    } catch (err) {
      return { pubsub };
    }
  },
  subscriptions: {
    onConnect(connectionParams) {
      return connectionParams;
    },
  },
});

mongoose
  .connect(process.env.MONGODB || "", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen({ port: process.env.PORT || 4000 }).then(async ({ url }) => {
      debug(`🚀 Server ready at ${url}`);
    });
  })
  .catch((err) => {
    debug(err);
  });
