import express from "express";
import {
  createStoreCategory,
  getAllCategories,
  getOneCategory,
  delete_catgory,
  updateCategory,
} from "#controllers/serviceCategory.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const serviceCategoryRoute = express.Router();
serviceCategoryRoute
  .route("/")
  .post(multerUpload.single("image"), createStoreCategory);
serviceCategoryRoute
  .route("/store/:id")
  .get(validateObjectId, getAllCategories);
serviceCategoryRoute.route("/:id").get(validateObjectId, getOneCategory);
serviceCategoryRoute.route("/:id").delete(validateObjectId, delete_catgory);
serviceCategoryRoute.route("/:id").put([multerUpload.single("image"),validateObjectId], updateCategory);

export default serviceCategoryRoute;
