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
import { User } from "#models/user_model";

/*****  Modules  *****/
import connectDB from "#config/db";
import logger from "#utils/logger";
import routes from "#routes/index";
import {envConfig} from "#utils/env";
import cookieParser from "cookie-parser";
import log from "#middlewares/log";
import { SOCKET_ORIGINS } from "#constant/constant";

import { firebaseNotification } from "#utils/firebaseNotification";

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
     if(booking?.coupons_Id && booking?.discount)
     {
      await Coupon.findByIdAndUpdate(
        booking?.coupons_Id,
        {
          $inc: { quantity: 1, totalAmount: -booking?.discount},
        }
      );
     }
      await sockets.sendSessionExpired(bookDetails?.user_Id)
    }
  }
});



schedule.scheduleJob("0 1 * * *", async () => {
  const notification = {
    title: "Appointment Reminder",
    body: `Appointment Reminder: Your party makeup booking is scheduled for 4:00 PM at Rose Beauty Salon. Please stay reminded`
  }

  const user  = await User.findOne({email:'sk5908774@gmail.com'})

  await firebaseNotification(
    notification,
    [user],
    "news",
    "Specific-User",
    "system",
    "users"
  )
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
