import mongoose from "mongoose";
import Joi from "joi";
const UserVerificationSchema = new mongoose.Schema({

    email: {
        type: String,
    },
    otp : {
        type: String,
        unique:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 }
    },

});

function validateUserVerification(user) {
    const schema = Joi.object({
        otp : Joi.string().required(),
        email: Joi.string()
        .required()
        .email()
    });
  
    return schema.validate(user);
  }
  
  const UserVerification = mongoose.model("UserVerification", UserVerificationSchema)

  export { UserVerification, validateUserVerification }
  


