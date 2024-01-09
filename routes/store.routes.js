import express from "express";
import {
  createStore,
  getAllStore,
  getOneStore,
  changeStoreStatus,
  updateStore,
  getStoreAnalytics,
  getStoreGraphsData,
  completeStoreInfo,
  sendStoreNotification,
  getStoreNotification,
  StoreNotificationSeen,
  storeReferralLinkGenerated,
  getStoreReferral,
} from "#controllers/store.controller";
import {
  createStoreCoupon,
  deleteStoreCoupon,
  getAllStoreCoupons,
  validateStoreCoupon
} from "#controllers/StoreCoupon.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";
import { getStoreAvailableSlots } from "#controllers/slots.controller";

const storeRoute = express.Router();

storeRoute.route("/").post(multerUpload.single("image"), createStore).get(getAllStore);

//Create referral
storeRoute.post("/referral/:id", storeReferralLinkGenerated);

//Get Referral Store
storeRoute.get("/referral/:id", [validateObjectId], getStoreReferral);

storeRoute.get("/complete-info/:id", [validateObjectId], completeStoreInfo);
storeRoute.post("/coupon", createStoreCoupon);

storeRoute.route("/update/:id").put(
  validateObjectId,
  multerUpload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "gallery",
      maxCount: 30,
    },
    {
      name: "documents",
      maxCount: 10,
    },
  ]),
  updateStore
);

storeRoute.route("/:id").get(validateObjectId, getOneStore);
storeRoute.route("/coupon/:id").get(validateObjectId, getAllStoreCoupons);
storeRoute.route("/coupon/validate/:id").get(validateObjectId, validateStoreCoupon);
storeRoute.route("/coupon/:id").delete(validateObjectId, deleteStoreCoupon);

storeRoute.route("/slots/:id").get(validateObjectId, getStoreAvailableSlots);

storeRoute
  .route("/change-status/:id")
  .post(validateObjectId, changeStoreStatus);

storeRoute
  .route("/analytics/graph_info/:id")
  .get(validateObjectId, getStoreGraphsData);
storeRoute
  .route("/analytics/store_info/:id")
  .get(validateObjectId, getStoreAnalytics);

storeRoute
  .route("/notification/send/:id")
  .post(
    [validateObjectId, multerUpload.single("image")],
    sendStoreNotification
  );
storeRoute
  .route("/notification/:id")
  .get(validateObjectId, getStoreNotification);
storeRoute
  .route("/notification-seen/:id")
  .get(validateObjectId, StoreNotificationSeen);

export default storeRoute;
