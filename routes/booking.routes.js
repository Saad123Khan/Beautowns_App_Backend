import express from 'express';
import { bookingCheckIn,createBooking,getAllStoreBooking,getUserBooking , cancelledBooking,couponCodeBookingAdded ,bookingConfirm} from '#controllers/booking.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const bookingRoute = express.Router();

bookingRoute.route('/').post(createBooking);

bookingRoute.route('/:id').get(validateObjectId,getAllStoreBooking);

bookingRoute.route('/user/:id').get(validateObjectId,getUserBooking);


bookingRoute.route('/cancelled').post(cancelledBooking);


bookingRoute.route('/coupon-added').post(couponCodeBookingAdded);

bookingRoute.route('/confirmed').post(bookingConfirm);

bookingRoute.route('/checkIn').post(bookingCheckIn);



export default bookingRoute;