import express from "express";
import {
  updateStaff,
  createSalonStaff,
  getAllStoreStaffs,
  getOneStaff,
  delete_staff,
  getStaffNotification,
  staffNotificationSeen,
  changeStaffStatus,
  getStaffReferral,
  getStaffGraph,
  getStaffAnalytics,
  staffReferralLinkGenerated
} from "#controllers/staff.controller";

import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const staffRoute = express.Router();


staffRoute.post("/referral/:id",staffReferralLinkGenerated);

staffRoute.get("/referral/:id", [validateObjectId], getStaffReferral);

staffRoute.route("/").post(multerUpload.single("image"), createSalonStaff);
staffRoute.route("/change-status/:id").get(validateObjectId, changeStaffStatus);

staffRoute
  .route("/update/:id")
  .put([validateObjectId, multerUpload.single("image")], updateStaff);
staffRoute.route("/store/:id").get(validateObjectId, getAllStoreStaffs);

staffRoute.route("/:id").get(validateObjectId, getOneStaff);
staffRoute.route("/analytics/:id").get(validateObjectId, getStaffAnalytics);
staffRoute.route("/graph/:id").get(validateObjectId, getStaffGraph);
staffRoute.route("/:id").delete(validateObjectId, delete_staff);

staffRoute
  .route("/notification/:id")
  .get(validateObjectId, getStaffNotification);

staffRoute.route("/").post(multerUpload.single("image"), createSalonStaff);

staffRoute.get("/notification-seen/:id", staffNotificationSeen);

export default staffRoute;
