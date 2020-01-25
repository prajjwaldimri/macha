import dotenv from "dotenv";
dotenv.config();

const debug = require("debug")("dev");

import { ApolloServer } from "apollo-server";
import mongoose from "mongoose";

import * as allTypes from "./schema";
import { makeSchema } from "nexus";
import path from "path";

const schema = makeSchema({
  types: allTypes,
  outputs: {
    schema: path.join(__dirname, "./generated/schema.graphql"),
    typegen: path.join(__dirname, "./generated/my-generated-types.d.ts")
  }
});

const server = new ApolloServer({ schema });

// DB Connection

mongoose
  .connect(process.env.MONGODB || "", { useNewUrlParser: true })
  .then(() => {
    server.listen().then(({ url }) => {
      debug(`🚀 Server ready at ${url}`);
    });
  })
  .catch(err => {
    debug(err);
  });
