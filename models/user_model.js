import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { getEnv } from "#utils/env";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin", "store", "staff"],
      default: "user",
    },
    favourite: {
      stores: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
      ],
      services: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    not_token: {
      type: String,
    },
    image: {
      type: String,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspend: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified()) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.generateAuthToken = function () {
  const payload = { _id: this._id, name: this.name, email: this.email };
  const secret = getEnv("JWT_SECRET");
  const options = { expiresIn: "1d" };
  return jwt.sign(payload, secret, options);
};

function validateUser(user) {
  const schema = Joi.object({
    role: Joi.string().valid("user", "admin", "store", "staff"),
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    gender: Joi.string().valid("male", "female", "other"),
    password: Joi.string().min(8).max(255).required(),
    image: Joi.string(),
    phone: Joi.string(),
    
    not_token: Joi.string(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });

  return schema.validate(user);
}

const User = mongoose.model("User", UserSchema);

export { User, validateUser };
