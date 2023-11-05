import express from 'express';
import { createBooking,getAllStoreBooking,getUserBooking , cancelledBooking,couponCodeBookingAdded } from '#controllers/booking.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const bookingRoute = express.Router();

bookingRoute.route('/').post(createBooking);

bookingRoute.route('/:id').get(validateObjectId,getAllStoreBooking);

bookingRoute.route('/user/:id').get(validateObjectId,getUserBooking);


bookingRoute.route('/cancelled/:id').post(validateObjectId,cancelledBooking);


bookingRoute.route('/coupon-added').post(couponCodeBookingAdded);


export default bookingRoute;