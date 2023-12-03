import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    from_referral_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    to_referral_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rewarded_amount: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    rewarded_level: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["sign-up","customer"],
      default: "sign-up",
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

const Referral = mongoose.model("Referral", ReferralSchema);

export { Referral };
