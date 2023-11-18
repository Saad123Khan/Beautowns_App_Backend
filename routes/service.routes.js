import express from "express";
import {
  updateService,
  createService,
  getAllStoreServices,
  getOneService,
  delete_service,
  getServiceSpecific,
} from "#controllers/service.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const serviceRoute = express.Router();

serviceRoute.route("/").post(multerUpload.single("image"), createService);

serviceRoute
  .route("/update/:id")
  .put([validateObjectId, multerUpload.single("image")], updateService);

serviceRoute.route("/store/:id").get(validateObjectId, getAllStoreServices);

serviceRoute.route("/:id").get(validateObjectId, getOneService);
serviceRoute.route("/:id").delete(validateObjectId, delete_service);
serviceRoute.route("/specific").post(getServiceSpecific);

export default serviceRoute;
