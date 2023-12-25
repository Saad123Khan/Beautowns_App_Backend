import mongoose from "mongoose";
import Joi from "joi";

const MarketingSchema = new mongoose.Schema(
  {
    target: {
      type: String,
    },
    user_Ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
    target: Joi.string().required(),
    user_Ids: Joi.array().required(),
    store_Id: Joi.string().required(),
    image: Joi.string().required(),
  });

  return schema.validate(market);
}

const Marketing = mongoose.model("Marketing", MarketingSchema);

export { Marketing, validateMarketing };
