import express from 'express';
import { createBooking,getAllBooking } from '#controllers/booking.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const bookingRoute = express.Router();

bookingRoute.route('/').post(createBooking);

bookingRoute.route('/:id').get(validateObjectId,getAllBooking);

export default bookingRoute;