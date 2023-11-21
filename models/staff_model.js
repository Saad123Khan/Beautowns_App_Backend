import mongoose from "mongoose";
import Joi from "joi";

const StaffSchema = new mongoose.Schema({
    store_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
    },
    salon_staff_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    workingSchedule: [
        {
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            from: String,
            to: String,
            isAvailable: Boolean,
        },
    ],
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    phone:{
        type:String
    },
    image: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isSuspend: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


function validateStaff(service) {
    const schema = Joi.object({
        store_Id: Joi.string().required(),
        salon_staff_Id: Joi.string(),
        title: Joi.string().required(),
        name: Joi.string().required(),
    phone: Joi.number().required(),
        gender: Joi.string().valid('male', 'female', 'other').required(),
        description: Joi.string().required(),
        workingSchedule: Joi.array().items(
            Joi.object({
                day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
                from: Joi.string()
                .regex(/^([0-9]|1[0-2]|0[0-9]):[0-5][0-9][ap]m$/i)
                .required(),
              to: Joi.string()
                .regex(/^([0-9]|1[0-2]|0[0-9]):[0-5][0-9][ap]m$/i)
                .required(),

                isAvailable: Joi.boolean().required(),
            })
        ).min(7).max(7).unique('day', { ignoreUndefined: true }),
        image: Joi.string(),
        isDeleted: Joi.boolean(),
        isSuspend: Joi.boolean(),
    });
    return schema.validate(service);
}

const Staffs = mongoose.model("Staff", StaffSchema);

export { Staffs, validateStaff };
