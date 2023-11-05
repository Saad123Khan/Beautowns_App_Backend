import mongoose from "mongoose";
import Joi from "joi";

const PaymentSchema = new mongoose.Schema({
    booking_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
    },
    store_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
    },
    user_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    amount: {
        type: Number
    },
    phone: {
        type: String
    },
    isCancel: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


function validatePayment(booking) {
    const schema = Joi.object({
        booking_Id: Joi.string().required(),
        user_Id: Joi.string(),
        store_Id: Joi.string(),
        phone: Joi.string().required(),
        amount: Joi.number(),      
        isCancel: Joi.boolean(),
        isDeleted: Joi.boolean(),
    });

    return schema.validate(booking);
}

const Payment = mongoose.model("Payment", PaymentSchema);

export { Payment, validatePayment };





