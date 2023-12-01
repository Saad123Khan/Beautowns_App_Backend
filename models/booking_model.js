import mongoose from "mongoose";
import Joi from "joi";

const BookingSchema = new mongoose.Schema({
    service_Ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    }],
    user_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    store_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
    },
    coupons_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
    },
    salon_staff_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    payment_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    booking_type: {
        type: String,
        enum: ["manual", "auto"], 
    },
    vat: {
        type: Number
    },
    amount: {
        type: Number
    },
    discount: {
        type: Number
    },
    duration: {
        type: Number
    },
    end: {
        type: String
    },
    isCancel: {
        type: Boolean,
        default: false,
    },
    isCheckIn: {
        type: Boolean,
        default: false,
    },
    rating: {
        salon : Number,
        user : Number,
    },
    paymentDone: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
  isSessionExpired: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });


function validateBooking(booking) {
    const schema = Joi.object({
        service_Ids: Joi.array().items(Joi.string()).min(1).required(),
        user_Id: Joi.string().required(),
        store_Id: Joi.string(),
        payment_Id:Joi.string(),
        coupons_Id: Joi.string(),
        salon_staff_Id:Joi.string(),
        date: Joi.string().required(),
        time: Joi.string().required(),
        vat: Joi.number(),
        amount: Joi.number(),

        booking_type: Joi.string().valid("manual", "auto").required(),
        discount: Joi.number(),

        
        duration: Joi.number(),
        end: Joi.string(),
        isCancel: Joi.boolean(),
        isCheckIn: Joi.boolean(),
        rating: Joi.object().items(Joi.number()),
        paymentDone: Joi.boolean(),
        isDeleted: Joi.boolean(),
        isSessionExpired:Joi.boolean()
    });

    return schema.validate(booking);
}

const Booking = mongoose.model("Booking", BookingSchema);

export { Booking, validateBooking };
