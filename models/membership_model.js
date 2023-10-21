import mongoose from "mongoose";
import Joi from "joi";

const MembershipSchema = new mongoose.Schema(
  {
    store_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    name: {
      type: String,
    },
    noOfAttemps: {
      type: Number,
    },
    validity: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["months", "weeks"],
        required: true,
      },
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function validateMembership(member) {
  const schema = Joi.object({
    store_Id: Joi.string().required(),
    name: Joi.string().required(),
    services: Joi.array().required(),
    noOfAttemps: Joi.number().integer().positive().required(),
    validity: Joi.object({
      value: Joi.number().integer().positive().required(),
      unit: Joi.string().valid("months", "weeks").required(),
    }).required(),
    isDeleted: Joi.boolean(),
  });

  return schema.validate(member);
}

const MemberShips = mongoose.model("Membership_Schema", MembershipSchema);

export { MemberShips, validateMembership };
