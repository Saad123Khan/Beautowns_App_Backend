import mongoose from "mongoose";
import Joi from "joi";

const CouponsSchema = new mongoose.Schema({
  target: {
    type: String,
    enum: ["all", "specific"],
  },
  userIds: [
    {
      type: String,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  store_Id: {
    type: String,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },

  type: {
    fixedAmount: Number,
    percentage: Number,
  },
  value: {
    type: String,
  },
  validityDate: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  isSuspend: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

function validateCoupon(coupon) {
  const schema = Joi.object({
    target: Joi.string().valid("all", "specific").required(),
    userIds: Joi.array(),
    type: Joi.object({
      fixedAmount: Joi.number(),
      percentage: Joi.number(),
    }),
    value: Joi.string().required(),
    store_Id: Joi.string().required(),
    validityDate: Joi.string(),
    quantity: Joi.number().required(),
    totalAmount: Joi.number(),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });

  return schema.validate(coupon);
}

const StoreCoupon = mongoose.model("StoreCoupon", CouponsSchema);

export { StoreCoupon, validateCoupon };
