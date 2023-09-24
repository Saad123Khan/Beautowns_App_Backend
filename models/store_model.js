import mongoose from "mongoose";
import Joi from "joi";

const StoreSchema = new mongoose.Schema({
    salon_owner_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    category_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
    },

    name: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    street_name: {
        type: String,
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    segment_Id:
    {
        enum: [1, 2, 3],
        type: Number,
    },
  
    workingSchedule:
        [{

            day: {
                type: String,
                enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            from: {
                type: String,
            },
            to: {
                type: String,
            },
        }],
    gallery:
        [{
            type: String,
        }],
    rating: {
        type: Number,
        default:5
    },
    isSuspend: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


function validateStores(store) {
    const schema = Joi.object({
        salon_owner_Id: Joi.string().required(),
        categoryId: Joi.string().required(),
        name: Joi.string().required(),
        country: Joi.string().required(),
        city: Joi.string().required(),
        street_name: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        segment_Id: Joi.number().valid(1, 2, 3).required(),
        workingSchedule: Joi.array().items(Joi.object().keys({
            day: Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun').required(),
            from: Joi.string().required(),
            to: Joi.string().required(),
        })),
        gallery: Joi.array().items(Joi.string()),
        rating: Joi.number(),
        isSuspend: Joi.boolean(),
        isDeleted: Joi.boolean(),
    });
    return schema.validate(store);
}

const Store = mongoose.model("Store", StoreSchema);

export { Store, validateStores };
