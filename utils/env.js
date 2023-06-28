import dotenv from "dotenv"
import * as path from "path";
import {fileURLToPath} from "url";

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const envConfig = () => {
  if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: path.resolve(__dirname, "../config/dev.env")})
  } else {
    dotenv.config({path: path.resolve(__dirname, "../config/prod.env")})

  }
};


const isBoolean = (value) =>
  ['true', 'false'].includes(value)
    ? JSON.parse(value)
    : value

const getEnv = (name) => isBoolean(process.env[name]);


export {getEnv, envConfig};
