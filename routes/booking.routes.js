import express from "express";
import {
  bookingCheckIn,
  createBooking,
  getAllStoreBooking,
  getUserBooking,
  getStaffBooking,
  cancelledBooking,
  couponCodeBookingAdded,
  bookingConfirm,
  bookingsByCoupon
} from "#controllers/booking.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const bookingRoute = express.Router();

bookingRoute.route("/").post(createBooking);
bookingRoute.route("/store/:id").get(validateObjectId, getAllStoreBooking);
bookingRoute.route("/staff/:id").get(validateObjectId, getStaffBooking);
bookingRoute.route("/user/:id").get(validateObjectId, getUserBooking);
bookingRoute.route("/cancelled").post(cancelledBooking);
bookingRoute.route("/coupon-added").post(couponCodeBookingAdded);
bookingRoute.route("/confirmed").post(bookingConfirm);
bookingRoute.route("/checkIn").post(bookingCheckIn);
bookingRoute.route("/by-coupons/:id").get(validateObjectId,bookingsByCoupon);

export default bookingRoute;
