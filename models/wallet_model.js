import mongoose from "mongoose";
import Joi from "joi";

const walletSchema = new mongoose.Schema({
    user_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['admin', 'store' ,'staff','user'], 
    },
    balance : {
      type: Number,
      default:0
    },
  },{timestamps:true});

  
function validateWallet(wallet) {
    const schema = Joi.object({
      role: Joi.string().valid('admin', 'store' ,'staff','user'),
      user_Id: Joi.string().required(),
      balance: Joi.number()
    });
  
    return schema.validate(wallet);
  }
  
  const Wallet = mongoose.model("Wallet", walletSchema);
  
  export { Wallet, validateWallet };
  