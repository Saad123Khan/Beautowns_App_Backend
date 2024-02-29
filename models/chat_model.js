import mongoose from "mongoose";
import Joi from "joi";

const ChatSchema = new mongoose.Schema(
  {
    sender_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function validateChat(msg) {
  const schema = Joi.object({
    sender_Id: Joi.string().required(),
    receiver_Id: Joi.string().required(),
    message: Joi.string().required(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });

  return schema.validate(msg);
}

const Chat = mongoose.model("Chat", ChatSchema);

export { Chat, validateChat };
