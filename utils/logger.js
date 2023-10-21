import winston, {format} from "winston";
import winstonMongodb from "winston-mongodb"

import {envConfig, getEnv} from "#utils/env";

const logger = () => {
  envConfig();
  winston.add(
    new winston.transports.Console({
      colorize: true,
      format: format.combine(
        winston.format.simple(),
        winston.format.colorize(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/log_file.log',
      format: format.combine(
        // format.timestamp(), format.json()
        format.timestamp({
          format: 'HH-MM:ss YYYY-MM-DD'
        }),
        // format.prettyPrint(),
        // format.colorize(),
        // format.align(),
        format.printf(info => `[TIME:${info.timestamp}] - [TYPE:${info.level}] - [MESSAGE:${info.message}] - [STACK: ${info.stack}]`)
      ),
    }));
  winston.add(new winston.transports.MongoDB({
    options: {useUnifiedTopology: true},
    db: getEnv('MONGO_URI'),
    format: format.combine(
      format.errors({stack: true}),
      format.timestamp({format: 'HH-MM:ss YYYY-MM-DD'}),
      format.metadata()
    ),
  }));
  /*For Handling uncaughtException*/
  winston.exceptions.handle(
    new winston.transports.Console({colorize: true, prettyPrint: true}),
    new winston.transports.File({filename: 'logs/uncaughtException.log'}))

  process.on("uncaughtException", (error) => {
    throw error
  })
}

export default logger
