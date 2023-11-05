import express from 'express';
import { createBookingPayment,getAllStoreBookingPayment ,getAllUserBookingPayment } from '#controllers/payment.controller';
import validateObjectId from "#middlewares/validateObjectId";

const paymentRoute = express.Router();

paymentRoute.route('/booking/:id').post(validateObjectId,createBookingPayment);

paymentRoute.route('/store/:id').get(validateObjectId,getAllStoreBookingPayment);

paymentRoute.route('/user/:id').get(validateObjectId,getAllUserBookingPayment);
export default paymentRoute;