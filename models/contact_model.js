import mongoose from "mongoose";
import Joi from "joi";

const ContactSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String
    },   
    phone: {
        type: String
    }

}, { timestamps: true });


function validateContact(category) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
       });

    return schema.validate(category);
}

const Contact = mongoose.model("Contact", ContactSchema);

export { Contact, validateContact };
