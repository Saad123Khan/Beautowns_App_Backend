import mongoose from "mongoose";
import Joi from "joi";

const NotificationSchema = new mongoose.Schema(
  {
    store_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    title: {
      type: String,
    },
    type: {
      type: String,
      enum: ["news", "offer"],
    },
    target: {
      type: String,
      enum: ["all", "specific"],
    },
    message: {
      type: String,
    },
    redirect_Url: {
      type: String,
    },
    image: {
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

function validateNotification(noti) {
  const schema = Joi.object({
    store_Id: Joi.string().required(),
    target: Joi.string().required(),
    message: Joi.string().required(),
    type: Joi.string().required(),
    redirect_Url: Joi.string(),
    title: Joi.string().required(),
    image: Joi.string(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });

  return schema.validate(noti);
}

const StoreNotification = mongoose.model("StoreNotification", NotificationSchema);

export { StoreNotification, validateNotification };
