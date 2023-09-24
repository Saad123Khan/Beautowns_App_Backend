import mongoose from "mongoose";
import Joi from "joi";

const CategoriesSchema = new mongoose.Schema({
    name: {
        type: String
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


function validateCategories(category) {
    const schema = Joi.object({
        name: Joi.string().required(),
        image: Joi.string(),
        isDeleted: Joi.boolean(),
        isSuspend: Joi.boolean(),
    });

    return schema.validate(category);
}

const Categories = mongoose.model("Categories", CategoriesSchema);

export { Categories, validateCategories };
