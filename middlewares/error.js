import winston from "winston";
import {getEnv} from "#utils/env";

const error = (err, req, res,next) => {
  winston.error(err.message,err);
  console.log(err);
  if(getEnv('NODE_ENV') === 'DEVELOPMENT') {
    res.status(500).send(err);
  }else {
    res.status(500).send("Something failed")
  }

}

export default error
