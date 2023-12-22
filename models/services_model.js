import mongoose from "mongoose";
import Joi from "joi";

const ServicesSchema = new mongoose.Schema({
    store_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
    },
    service_category_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store_Categories",
    },
    name: {
        type: String
    },
    description: {
        type: String,
    },
    value: {
        type: Number,
    },
    // noOfPeople: {
    //     type: Number
    // },
    segment_Id: 
        {
            enum: [1, 2, 3],
            type: Number
        },
    duration: {
        type: Number,
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


function validateServices(service) {
    const schema = Joi.object({
        store_Id: Joi.string().required(),
        service_category_Id: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string().required(),
        value: Joi.number().required(),
        // noOfPeople: Joi.number().required(),
        segment_Id: Joi.number().valid(1, 2, 3).required(),
        duration: Joi.number().required(),
        image: Joi.string(),
        isDeleted: Joi.boolean(),
        isSuspend: Joi.boolean(),
    });

    return schema.validate(service);
}

const Service = mongoose.model("Service", ServicesSchema);

export { Service, validateServices };
