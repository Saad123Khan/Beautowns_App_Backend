import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import { Payment, validatePayment } from "#models/payment_model";
import { Booking } from "#models/booking_model";

//@desc  Booking Payment
//@route  /payment
//@request Get Request
//@acess  private

const createBookingPayment = asyncHandler(async (req, res) => {
  const { error } = validatePayment(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "User record not found" });
  }

  const bookingFind = await Booking.findOne({
    _id: req.body.booking_Id,
    user_Id: req.params.id,
    isCheckIn: false,
    isCancel: false,
    isDeleted: false,
  });

  if (!bookingFind) {
    return res
      .status(404)
      .json({ status: false, message: "Booking record not found" });
  }

  if (bookingFind?.isSessionExpired) {
    return res
      .status(404)
      .json({ status: false, message: "Booking Session expired" });
  }

  const paymentFind = await Payment.findOne({
    booking_Id: req.body.booking_Id,
    isCancel: false,
    isDeleted: false,
  });
  if (paymentFind) {
    return res.status(400).json({
      status: false,
      message: "Payment for the booking has already been made",
    });
  }

  const paymentCreated = await new Payment({
    booking_Id: req.body.booking_Id,
    user_Id: bookingFind?.user_Id,
    store_Id: bookingFind?.store_Id,
    phone: req.body.phone,
    amount: bookingFind?.amount,
  }).save();

  let booking = await Booking.findByIdAndUpdate(
    bookingFind?._id,
    { payment_Id: paymentCreated?._id, paymentDone: true },
    { new: true }
  );

  if (booking) {
    return res.status(200).json({
      status: true,
      message: "The booking has been confirmed.",
      booking: booking,
    });
  } else {
    return res.status(400).json({
      status: false,
      message: "Something error while creating payment",
    });
  }
});

//@desc  User Get All
//@route  /user
//@request Get Request
//@acess  private

const getAllStoreBookingPayment = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ store_Id: req.params.id })
    .populate({
      path: "user_Id store_Id",
      select: "name",
    })
    .populate({
      path: "booking_Id",
      select: "time end service_Ids",
      populate: {
        path: "service_Ids",
        select: "name",
      },
    });
  if (payments?.length > 0) {
    return res.status(200).json({
      status: true,
      payments,
    });
  } else {
    return res
      .status(200)
      .json({ status: true, message: "Payment record not found" });
  }
});

//@desc  User Get One
//@route  /user/:id
//@request Get Request
//@acess  private

const getOnePaymentDetails = asyncHandler(async (req, res) => {
  const user = await Payment.findById(req.params.id);
  if (user) {
    return res.status(200).json({
      status: true,
      user,
    });
  } else {
    return res
      .status(200)
      .json({ status: true, message: "User record not found" });
  }
});

//@desc  User Get All
//@route  /user
//@request Get Request
//@acess  private

const getAllUserBookingPayment = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user_Id: req.params.id });
  if (payments?.length > 0) {
    return res.status(200).json({
      status: true,
      payments,
    });
  } else {
    return res
      .status(404)
      .json({ status: false, message: "Payment record not found" });
  }
});

export {
  getAllUserBookingPayment,
  getAllStoreBookingPayment,
  getOnePaymentDetails,
  createBookingPayment,
};
