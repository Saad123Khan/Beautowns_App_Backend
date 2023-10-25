import mongoose from "mongoose";
import Joi from "joi";

const BookingSchema = new mongoose.Schema({
    service_Id: {
        type: mongoose.Schema.Types.Number,
        ref: "Service",
    },
    user_Id: {
        type: mongoose.Schema.Types.Number,
        ref: "User",
    },
    coupons_Id: {
        type: mongoose.Schema.Types.Number,
        ref: "Coupon",
    },
    salon_staff_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    vat: {
        type: Number,
        required: true,
    },
    endAt: {
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
        type: [Number],
    },
    paymentDone: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


function validateBooking(booking) {
    const schema = Joi.object({
        service_Id: Joi.string().required(),
        user_Id: Joi.string().required(),
        coupons_Id: Joi.string(),
        coupons_Id: Joi.string(),
        salon_staff_Id:Joi.string(),
        date: Joi.string().required(),
        time: Joi.string().required(),
        vat: Joi.number().required(),
        endAt: Joi.string(),
        isCancel: Joi.boolean(),
        isCheckIn: Joi.boolean(),
        rating: Joi.array().items(Joi.number()),
        paymentDone: Joi.boolean(),
        isDeleted: Joi.boolean(),
    });

    return schema.validate(booking);
}

const Booking = mongoose.model("Booking", BookingSchema);

export { Booking, validateBooking };
