/*****  Packages  *****/
import mongoose from "mongoose";
import winston from "winston";
/*****  Modules  *****/
import {getEnv} from "#utils/env";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(getEnv('MONGO_URI'), {});
    winston.info(`MongoDB Connected`)
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1)
  }
}

export default connectDB
