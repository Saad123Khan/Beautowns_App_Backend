import { Blog, validateBlogs } from "#models/blogs_model";
import { Store } from "#models/store_model";
import asyncHandler from "#middlewares/asyncHandler";
import { PATH, LIVEPATH } from "#constant/constant";
import Joi from "joi";

function validateUpdateBlogs(store) {
  const schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    author_image: Joi.string(),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });
  return schema.validate(store);
}

const createBlog = asyncHandler(async (req, res) => {
  const image = req?.files?.image?.[0]?.filename;
  const author_image = req?.files?.author_image?.[0]?.filename;
  req.body.image = image && `${LIVEPATH}/uploads/${image}`;
  req.body.author_image = author_image && `${LIVEPATH}/uploads/${author_image}`;


  
  const { error } = validateBlogs(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const store = await Store.findOne({
    _id: req.body.store_Id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const blog = await new Blog(req.body).save();
  if (blog) {
    return res
      .status(201)
      .send({ status: true, message: "Sucessfully created Blog", blog });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something Error while creating Blog",
    });
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const store = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const blog = await Blog.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (blog?.length > 0) {
    return res.status(200).send({ status: true, blog });
  } else {
    return res.status(404).send({
      status: false,
      message: "Blogs Not Found",
    });
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { error } = validateUpdateBlogs(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const isStoreExist = await Store.findOne({
    store_Id: req.body.store_Id,
    isDeleted: false,
    isSuspend: false,
  });
  if (!isStoreExist) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const isBlogExist = await Blog.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });
  if (isBlogExist) {
    const image = req?.files?.image?.[0]?.filename;
    const author_image = req?.files?.author_image?.[0]?.filename;
    req.body.image = image
      ? `${LIVEPATH}/uploads/${image}`
      : isBlogExist?.image;
    req.body.author_image = author_image
      ? `${LIVEPATH}/uploads/${author_image}`
      : isBlogExist?.author_image;

    const updateBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (updateBlog) {
      res.status(200).send({
        status: true,
        message: "Successfully Updated blog",
        updateBlog,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Something Error while updating service",
      });
    }
  } else {
    return res.status(404).send({
      status: false,
      message: "Blog Not Exists",
    });
  }
});

const getSingleBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (blog) {
    return res.status(200).send({ status: true, blog: blog });
  } else {
    return res.status(404).send({
      status: false,
      message: "Blog Not Found",
    });
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (blog) {
    blog.isDeleted = true;
    const delete_blog = await blog.save();
    if (delete_blog) {
      return res
        .status(200)
        .send({ status: true, message: "Successfully deleted Blog" });
    } else {
      return res.status(500).send({
        status: false,
        message: "Something went wrong while deleting the blog",
      });
    }
  } else {
    return res.status(404).send({
      status: false,
      message: "Blog Not Exists",
    });
  }
});

export { createBlog, getAllBlogs, getSingleBlog, deleteBlog, updateBlog };
