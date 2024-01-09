import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import _ from "lodash";
import { Booking } from "#models/booking_model";
import { StoreCoupon, validateCoupon } from "#models/store_coupon_model";
import mongoose from "mongoose";
import { Store } from "#models/store_model";

const createStoreCoupon = asyncHandler(async (req, res) => {
  const { error } = validateCoupon(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const isStoreExist = await Store.findOne({
    _id: req.body.store_Id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!isStoreExist) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
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
  let couponValue = await StoreCoupon.findOne({ value: req.body.value });

  if (couponValue) {
    return res.status(400).send({
      status: false,
      message: "Same coupon value already exists, plz use unique value",
    });
  }

  const couponCreated = await new StoreCoupon(req.body).save();
  if (couponCreated) {
    const coupons = await StoreCoupon.find({
      store_Id: couponCreated?.store_Id,
      isDeleted: false,
    });
    return res.status(201).send({
      status: true,
      message: "Coupon Created Sucessfully",
      coupon: couponCreated,
      coupons: coupons,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something error while creating coupon",
    });
  }
});

const getAllStoreCoupons = asyncHandler(async (req, res) => {
  const isStoreExist = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!isStoreExist) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const coupons = await StoreCoupon.find({
    store_Id: req.params.id,
    isDeleted: false,
  });
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

const deleteStoreCoupon = asyncHandler(async (req, res) => {
  const coupon = await StoreCoupon.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (coupon) {
    await StoreCoupon.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true }
    );

    const coupons = await StoreCoupon.find({
      store_Id: coupon?.store_Id,
      isDeleted: false,
    });
    return res.status(200).send({
      status: true,
      message: "Coupon deleted successfully",
      coupons: coupons,
    });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Coupon does not exists" });
  }
});

const updateStoreCoupon = asyncHandler(async (req, res) => {
  const { error } = validateCoupon(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const couponFind = await StoreCoupon.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!couponFind)
    return res
      .status(404)
      .send({ status: false, message: "Coupon does not exists." });

  const couponUpdate = await StoreCoupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  return res.status(200).json({
    status: true,
    message: "Coupon updated successfully",
    coupon: couponUpdate,
  });
});

// const validateStoreCoupon = asyncHandler(async (req, res) => {
//   const user = await User.findOne({ _id: req.params.id, isDeleted: false });
//   if (!user)
//     return res.status(404).send({ status: false, message: "User not exists" });

//   const coupon = await StoreCoupon.findOne({
//     value: req.query.value,
//     isDeleted: false,
//     isSuspend: false,
//   });

//   if (coupon) {
//     const book = await Booking.findOne({
//       coupons_Id: coupon?._id,
//       user_Id: req.body.user_Id,
//       paymentDone: true,
//     });
//     if (book) {
//       return res
//         .status(404)
//         .send({ status: false, message: "Coupon already used" });
//     }

//     if (new Date(coupon?.validityDate) <= new Date()) {
//       return res
//         .status(404)
//         .send({ status: false, message: "Coupon expired!" });
//     }
//     if (!coupon?.quantity > 0) {
//       return res
//         .status(404)
//         .send({ status: false, message: "Coupon expired!" });
//     }

//     if (coupon?.target !== "specific") {
//       return res
//         .status(200)
//         .send({
//           status: true,
//           message: "Coupon added sucessfully",
//           coupon: coupon,
//         });
//     } else {
//       const isValidUserId =
//         user?._id && coupon?.userIds.some((userId) => userId === user?._id);
//       if (isValidUserId) {
//         return res
//           .status(200)
//           .send({
//             status: true,
//             message: "Coupon added sucessfully",
//             coupon: coupon,
//           });
//       } else {
//         return res
//           .status(404)
//           .send({ status: false, message: "Invalid coupon code" });
//       }
//     }
//   } else {
//     return res
//       .status(404)
//       .send({ status: false, message: "Invalid coupon code" });
//   }
// });

const validateStoreCoupon = asyncHandler(async (req, res) => {

  // if(req.body.store_Id){
  //   const findStoreOwner = await Store.findOne({_id:req.body.store_Id})
  //   req.params.id = findStoreOwner?.salon_owner_Id
  
  // }
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
      return res.status(200).send({
        status: true,
        message: "Coupon added sucessfully",
        coupon: coupon,
      });
    } else {
      const isValidUserId =
        user?._id && coupon?.userIds.some((userId) => userId === user?._id);
      if (isValidUserId) {
        return res.status(200).send({
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

const validateStoreCouponForBooking = asyncHandler(async (req, res) => {
 
  const coupon = await StoreCoupon.findOne({
    value: req.body.couponCode,
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
      return coupon;
    } 
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Invalid coupon code" });
  }
});

export {
  //   getOneCoupon,
  //   getAllCoupons,
  //   deletedCoupon,
  //   updateCoupon,
  validateStoreCouponForBooking,
  validateStoreCoupon,
  deleteStoreCoupon,
  getAllStoreCoupons,
  createStoreCoupon,
};
