import express from "express";
import {
  createCategory,
  getAllCategories,
  updateStoreCategory,
  deleteStoreCategory
} from "#controllers/Admin/admin.storeCategory.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const adminStoreCategoryRoute = express.Router();

adminStoreCategoryRoute
  .route("/")
  .post(multerUpload.single("image"), createCategory)
  .get(getAllCategories);
adminStoreCategoryRoute
  .route("/:id")
  .put([multerUpload.single("image"), validateObjectId], updateStoreCategory);
adminStoreCategoryRoute
  .route("/:id")
  .delete(validateObjectId, deleteStoreCategory);

export default adminStoreCategoryRoute;
