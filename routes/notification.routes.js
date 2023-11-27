import express from "express";
import {
  createNotification,
  getAllNotification,
} from "#controllers/notification.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const notificationRoute = express.Router();
notificationRoute
  .route("/")
  .post(multerUpload.single("image"), createNotification);
notificationRoute.route("/store/:id").get(validateObjectId, getAllNotification);

export default notificationRoute;
