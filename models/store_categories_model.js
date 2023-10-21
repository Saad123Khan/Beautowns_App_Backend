import mongoose from "mongoose";
import Joi from "joi";

const StoreCategoriesSchema = new mongoose.Schema({
    store_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
    },
    name: {
        type: String
    },
    image: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


function validateStoreCategories(category) {
    const schema = Joi.object({
        store_Id: Joi.string().required(),
        name: Joi.string().required(),
        image: Joi.string(),
        isDeleted: Joi.boolean(),
    });

    return schema.validate(category);
}

const StoreCategories = mongoose.model("Store_Categories", StoreCategoriesSchema);

export { StoreCategories, validateStoreCategories };
