import mongoose from "mongoose";
import Joi from "joi";

const StoreSchema = new mongoose.Schema(
  {
    salon_owner_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    store_pofile_progess: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
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
      type: Number,
    },
    longitude: {
      type: Number,
    },
    segment_Id: {
      enum: [1, 2, 3],
      type: Number,
    },
    image: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 5,
    },
    isSuspend: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const storeTimingSchema = new mongoose.Schema(
  {
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    store_timings: [
      {
        day: String,
        from: String,
        to: String,
        isAvailable: Boolean,
      },
    ],

    isSuspend: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const storeDocuments = new mongoose.Schema(
  {
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    images: [
      {
        type: String,
      },
    ],

    isSuspend: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function validateStores(store) {
  const schema = Joi.object({
    salon_owner_Id: Joi.string().required(),
    name: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    phone: Joi.number().required(),
    street_name: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    segment_Id: Joi.number().valid(1, 2, 3).required(),
    images: Joi.array().items(Joi.string()),
    rating: Joi.number(),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });
  return schema.validate(store);
}

function ValidateStoreTime(store) {
  const schema = Joi.object({
    store_id: Joi.string().required(),
    store_timings: Joi.array(),
    //   .items(
    //     Joi.object().keys({
    //       day: Joi.string(),
    //       isAvailable: Joi.boolean(),
    //       from: Joi.string(),
    //       to: Joi.string(),
    //     })
    //   ),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });
  return schema.validate(store);
}

function ValidateStoreDocument(store) {
  const schema = Joi.object({
    store_id: Joi.string().required(),
    images: Joi.array(),
    //   .items(
    //     Joi.object().keys({
    //       day: Joi.string(),
    //       isAvailable: Joi.boolean(),
    //       from: Joi.string(),
    //       to: Joi.string(),
    //     })
    //   ),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });
  return schema.validate(store);
}

const Store = mongoose.model("Store", StoreSchema);
const StoreTime = mongoose.model("StoreTime", storeTimingSchema);
const StoreDocuments = mongoose.model("StoreDocuments", storeDocuments);

export { Store, StoreTime, StoreDocuments, validateStores,ValidateStoreDocument, ValidateStoreTime };
