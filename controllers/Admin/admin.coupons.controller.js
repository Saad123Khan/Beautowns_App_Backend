import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import _ from "lodash";
import { Coupon, validateCoupon } from "#models/coupons_model";
import mongoose from "mongoose";

const createdCoupon = asyncHandler(async (req, res) => {
  const { error } = validateCoupon(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  if (req.body.target === "specific") {
    if (req.body.userIds.length > 0) {
      req.body.userIds.forEach(async (item) => {
        if (!mongoose.Types.ObjectId.isValid(item)) {
          return res
            .status(400)
            .send({ status: false, message: `Invalid User ID. ${item}` });
        }
      });
    }

    const users = await User.find({ _id: { $in: req.body.userIds } });

    console.log(users);
    if (users?.length !== req.body.userIds.length) {
      return res
        .status(400)
        .send({ status: false, message: `Some user IDS are invalid` });
    }
  }
  let couponValue = await Coupon.findOne({ value: req.body.value });

  if (couponValue) {
    return res
      .status(400)
      .send({
        status: false,
        message: "Same coupon value already exists, plz use unique value",
      });
  }

  const couponCreated = await new Coupon(req.body).save();
  if (couponCreated) {
    return res
      .status(200)
      .send({
        status: true,
        message: "Coupon Created Sucessfully",
        coupon: couponCreated,
      });
  } else {
    return res
      .status(400)
      .send({
        status: false,
        message: "Something error while creating coupon",
      });
  }
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ isDeleted: false });
  if (coupons?.length > 0) {
    return res.status(200).json({
      status: true,
      coupons,
    });
  } else {
    return res
      .status(200)
      .json({ status: true, message: "Coupons record not found" });
  }
});

const getOneCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ _id: req.params.id, isDeleted: false });
  if (coupon) {
    return res.status(200).json({
      status: true,
      coupon,
    });
  } else {
    return res
      .status(200)
      .json({ status: true, message: "Coupon record not found" });
  }
});

const deletedCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ _id: req.params.id, isDeleted: false });
  if (coupon) {
    await Coupon.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Coupon deleted successfully" });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Coupon does not exists" });
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { error } = validateCoupon(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const couponFind = await Coupon.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!couponFind)
    return res
      .status(404)
      .send({ status: false, message: "Coupon does not exists." });

  const couponUpdate = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  return res.status(200).json({
    status: true,
    message: "Coupon updated successfully",
    coupon: couponUpdate,
  });
});
export {
  getOneCoupon,
  getAllCoupons,
  deletedCoupon,
  updateCoupon,
  createdCoupon,
};
