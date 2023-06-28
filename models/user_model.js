import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { getEnv } from "#utils/env";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  role:{
   type:String,
   enum:['user','admin','store'],
   default:'user'
  },
  name:{
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
},{timestamps : true});

UserSchema.pre('save', async function (next) {
  if (!this.isModified())
      return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.generateAuthToken = function () {
  const payload = {_id: this._id, name: this.name, email: this.email};
  const secret = getEnv('JWT_SECRET');
  const options = {expiresIn: '1d'}
  return jwt.sign(payload, secret, options);
}


function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(255).required(),
});

  return schema.validate(user);
}

const User = mongoose.model("User", UserSchema);

export { User, validateUser};
