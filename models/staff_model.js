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
    title:{
        type: String,
    },
    description: {
        type: String,
    },
    workingSchedule:
        [{

            day : {
                type: String,
                enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun']
            },
            from: {
                type: String,
            },
            to: {
                type: String,
            },                
        }],
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
        salon_staff_Id: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        workingSchedule: Joi.array().items(Joi.object({
            day: Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun').required(),
            from: Joi.string().required(),
            to: Joi.string().required(),
        })),
        image: Joi.string(),
        isDeleted: Joi.boolean(),
        isSuspend: Joi.boolean(),
    });
    return schema.validate(service);
}

const Staffs = mongoose.model("Staff", StaffSchema);

export { Staffs, validateStaff };
