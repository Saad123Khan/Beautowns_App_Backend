import mongoose from "mongoose";
import Joi from "joi";

const StoreSchema = new mongoose.Schema(
  {
    salon_owner_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
    },
    name: {
      type: String,
    },
    details: {
      type: String,
    },
    phone:{
      type: String,  
    },   
    location: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    documents: [
      {
        type: String,
      },
    ],
    store_timings: [
      {
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        from: String,
        to: String,
        isAvailable: Boolean,
      },
    ],
    segment_Id: {
      enum: [1, 2, 3],
      type: Number,
    },
    image: {
      type: String,
    },
    gallery: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 5,
    },
    completeProgess: { type: Number, default: 1 },

    isSuspend: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);



function validateStores(store) {
  const schema = Joi.object({
    salon_owner_Id: Joi.string().required(),
    category_Id: Joi.string().required(),
    name: Joi.string().required(),

    details: Joi.string().required(),
    location: Joi.string().required(),

    country: Joi.string().required(),
    city: Joi.string().required(),
    phone: Joi.number().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    store_timings: Joi.array().items(
      Joi.object({
        day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
        from: Joi.string().regex(/^([1-9]|1[0-2]):[0-5][0-9][ap]m$/i).required(),
        to: Joi.string().regex(/^([1-9]|1[0-2]):[0-5][0-9][ap]m$/i).required(),
        isAvailable: Joi.boolean().required(),
      })
    ).min(7).max(7).unique('day', { ignoreUndefined: true }),
    documents: Joi.array().items(Joi.string()),
    segment_Id: Joi.number().valid(1, 2, 3).required(),
    image: Joi.string(),
    gallery: Joi.array().items(Joi.string()),
    rating: Joi.number(),
    completeProgess: Joi.number(),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });
  return schema.validate(store);
}


const Store = mongoose.model("Store", StoreSchema);

export { Store, validateStores};
