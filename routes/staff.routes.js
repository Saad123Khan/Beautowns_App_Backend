import express from "express";
import {
  updateStaff,
  createSalonStaff,
  getAllStoreStaffs,
  getOneStaff,
  delete_staff,
  getStaffNotification,
  staffNotificationSeen
} from "#controllers/staff.controller";

import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const staffRoute = express.Router();

staffRoute.route("/").post(multerUpload.single("image"), createSalonStaff);

staffRoute
  .route("/update/:id")
  .put([validateObjectId, multerUpload.single("image")], updateStaff);
staffRoute.route("/store/:id").get(validateObjectId, getAllStoreStaffs);

staffRoute.route("/:id").get(validateObjectId, getOneStaff);

staffRoute.route("/:id").delete(validateObjectId, delete_staff);

staffRoute.route("/notification/:id").get(validateObjectId, getStaffNotification);

staffRoute.route("/").post(multerUpload.single("image"), createSalonStaff);

staffRoute.get("/notification-seen/:id", staffNotificationSeen);

export default staffRoute;
