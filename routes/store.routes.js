import express from "express";
import {
  createStore,
  getAllStore,
  getOneStore,
  changeStoreStatus,
  updateStore,
  getStoreStaffServices,
  getStoreAnalytics,
  getStoreGraphsData,
} from "#controllers/store.controller";
import {
  pushStoreNotification,
  getStoreNotification,
  StoreNotificationSeen,
} from "#controllers/storeNotification.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";
import { getStoreAvailableSlots } from "#controllers/slots.controller";

const storeRoute = express.Router();

storeRoute
  .route("/")
  .post(multerUpload.single("image"), createStore)
  .get(getAllStore);

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
storeRoute
  .route("/getStaffandServices/:id")
  .get(validateObjectId, getStoreStaffServices);

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
    pushStoreNotification
  );
storeRoute
  .route("/notification/:id")
  .get(validateObjectId, getStoreNotification);
storeRoute
  .route("/notification/seen/:id")
  .post(validateObjectId, StoreNotificationSeen);

export default storeRoute;
