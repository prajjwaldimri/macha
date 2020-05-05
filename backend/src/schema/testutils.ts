import dotenv from "dotenv";
dotenv.config();
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
const mongod = new MongoMemoryServer();

export const before = async () => {
  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
};

export const after = async () => {
  mongoose.disconnect();
  mongod.stop();
};
