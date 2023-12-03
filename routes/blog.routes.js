import express from "express";
import {
  createBlog,
  getAllBlogs,
  deleteBlog,
  updateBlog,
  getOneBlog
} from "#controllers/blog.controller";
import { multerUpload } from "#utils/multer";
import validateObjectId from "#middlewares/validateObjectId";

const blogRoute = express.Router();
blogRoute.route("/").post(
  multerUpload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "author_image",
      maxCount: 1,
    },
  ]),
  createBlog
);
blogRoute.route("/:id").put(
  validateObjectId,
  multerUpload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "author_image",
      maxCount: 1,
    },
  ]),
  updateBlog
);
blogRoute.route("/store/:id").get(validateObjectId, getAllBlogs);
blogRoute.route("/:id").get(validateObjectId, getOneBlog);
blogRoute.route("/:id").delete(validateObjectId, deleteBlog);

export default blogRoute;
