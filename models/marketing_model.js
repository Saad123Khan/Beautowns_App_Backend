import mongoose from "mongoose";
import Joi from "joi";

const MarketingSchema = new mongoose.Schema(
  {
    target: {
      type: String,
      enum: ["all", "specific"],
    },
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    store_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

function validateMarketing(market) {
  const schema = Joi.object({
    target: Joi.string().required().valid("all", "specific"),
    userIds: Joi.when('target', {
      is: 'specific',
      then: Joi.array().required(),
      otherwise: Joi.array().optional().allow(null),
    }),
    store_Id: Joi.string().required(),
    // image: Joi.string().required(),
  });

  return schema.validate(market);
}

const Marketing = mongoose.model("Marketing", MarketingSchema);

export { Marketing, validateMarketing };
