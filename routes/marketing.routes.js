import express from "express";
import {
  getAllStoreMarketing,
  sendMarketing,
} from "#controllers/marketing.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const marketingRoute = express.Router();

marketingRoute.route("/:id").get(validateObjectId, getAllStoreMarketing);
marketingRoute.route("/").post(multerUpload.single("image"), sendMarketing);

export default marketingRoute;
