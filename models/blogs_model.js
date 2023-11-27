import mongoose from "mongoose";
import Joi from "joi";

const BlogSchema = new mongoose.Schema(
  {
    store_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    title: {
      type: String,
    },
    author: {
      type: String,
    },
    description: {
      type: String,
    },

    image: {
      type: String,
    },
    author_image: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspend: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function validateBlogs(service) {
  const schema = Joi.object({
    store_Id: Joi.string().required(),
    title: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required(),
    author_image: Joi.string().required(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });

  return schema.validate(service);
}

const Blog = mongoose.model("Blog", BlogSchema);

export { Blog, validateBlogs };
