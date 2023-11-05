/*****  Packages  *****/
import cors from "cors";
import express from "express"
import winston from "winston";
import BodyParser from "body-parser";
import schedule from "node-schedule";
import SocketServer from "#sockets/SocketServer";
import { createServer } from "http";
import { Booking } from "#models/booking_model";
import moment from 'moment-timezone';

/*****  Modules  *****/
import connectDB from "#config/db";
import logger from "#utils/logger";
import routes from "#routes/index";
import {envConfig} from "#utils/env";
import cookieParser from "cookie-parser";
import log from "#middlewares/log";
import { SOCKET_ORIGINS } from "#constant/constant";


envConfig();
connectDB();
logger();

const app = express();
const PORT = process.env.PORT || 5000;

/*****  Middlewares  *****/
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(log);
app.use(express.json())
app.use(BodyParser.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

routes(app);


// Set the timezone to Karachi
moment.tz.setDefault('Asia/Karachi');

schedule.scheduleJob("*/5 * * * * *", async () => {
  const currentDateTime = moment();
  const bookingFind = await Booking.find({isCheckIn:false,paymentDone:false, isCancel:false,isDeleted:false,isSessionExpired:false});
// console.log(bookingFind,"BookingsFind")
  for (const booking of bookingFind) {
    const createdAtTime = moment(booking?.createdAt);
    const timeDifference = currentDateTime.diff(createdAtTime, 'minutes');
    // console.log(timeDifference)
   if (timeDifference > 20) {
      let bookDetails =await Booking.findByIdAndUpdate(booking?._id,{isSessionExpired:true},{new:true})
      await sockets.sendSessionExpired(bookDetails?.user_Id)
    }
  }
});

const server = createServer(app);
const sockets = new SocketServer(server, {
  cors: SOCKET_ORIGINS,
  transports: ["websocket", "polling"],
});

export { sockets };

server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);


// app.listen(PORT, () => winston.info(`Server is Listening on port ${PORT}.`));
