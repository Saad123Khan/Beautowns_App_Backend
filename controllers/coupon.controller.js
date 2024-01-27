import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import Joi from "joi";
import _ from "lodash";
import { PATH, LIVEPATH } from "#constant/constant";
import { Coupon } from "#models/coupons_model";
import { Booking } from "#models/booking_model";
import { StoreCoupon } from "#models/store_coupon_model";


const validateBookingCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({
    value: req.body.couponCode,
    isDeleted: false,
    isSuspend: false,
  });

  console.log(coupon, "coupon");
  if (coupon) {
    const book = await Booking.findOne({
      coupons_Id: coupon?._id,
      user_Id: req.body.user_Id,
      paymentDone: false,
    });
    console.log(book);
    if (book) {
      return false;
    }

    if (new Date(coupon?.validityDate) <= new Date()) {
      return false;
    }
    if (!coupon?.quantity > 0) {
      return false;
    }
    if (coupon?.target !== "specific") {
      return coupon;
    } else {
      const isValidUserId = coupon?.userIds.some(
        (userId) => userId === req.body.user_Id
      );
      if (isValidUserId) {
        return coupon;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
});

const validateCoupon = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false });
  if (!user)
    return res.status(404).send({ status: false, message: "User not exists" });

  const coupon = await StoreCoupon.findOne({
    value: req.query.value,
    isDeleted: false,
    isSuspend: false,
  });

  if (coupon) {
    const book = await Booking.findOne({
      coupons_Id: coupon?._id,
      user_Id: req.body.user_Id,
      paymentDone: true,
    });
    if (book) {
      return res
        .status(404)
        .send({ status: false, message: "Coupon already used" });
    }

    if (new Date(coupon?.validityDate) <= new Date()) {
      return res
        .status(404)
        .send({ status: false, message: "Coupon expired!" });
    }
    if (!coupon?.quantity > 0) {
      return res
        .status(404)
        .send({ status: false, message: "Coupon expired!" });
    }

    if (coupon?.target !== "specific") {
      return res
        .status(200)
        .send({
          status: true,
          message: "Coupon added sucessfully",
          coupon: coupon,
        });
    } else {
      const isValidUserId =
        user?._id && coupon?.userIds.some((userId) => userId === user?._id);
      if (isValidUserId) {
        return res
          .status(200)
          .send({
            status: true,
            message: "Coupon added sucessfully",
            coupon: coupon,
          });
      } else {
        return res
          .status(404)
          .send({ status: false, message: "Invalid coupon code" });
      }
    }
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Invalid coupon code" });
  }
});

export { validateCoupon, validateBookingCoupon };
