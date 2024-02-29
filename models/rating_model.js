import mongoose from "mongoose";
import Joi from "joi";

const RatingSchema = new mongoose.Schema(
  {
    booking_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    store_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    user_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: String,
    },
    comment: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspend: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function validateRating(rate) {
  const schema = Joi.object({
    booking_Id: Joi.string().required(),
    rating: Joi.string().required(),
    comment: Joi.string().optional(),
    user_Id: Joi.string().required(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });

  return schema.validate(rate);
}

const Rating = mongoose.model("Rating", RatingSchema);

export { Rating, validateRating };
