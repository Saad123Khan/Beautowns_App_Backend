import express from "express";
import {
  createStore,
  getAllStore,
  getOneStore,
  createStoreTiming,
  getStoreTiming,
  createStoreDocuments,
  changeStoreStatus,
  getStoreDocuments,
} from "#controllers/store.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const storeRoute = express.Router();

storeRoute
  .route("/")
  .post(multerUpload.array("images"), createStore)
  .get(getAllStore);
storeRoute
  .route("/documents/:id")
  .post(validateObjectId, multerUpload.array("images"), createStoreDocuments);
storeRoute.route("/save-store-timing").post(createStoreTiming);
storeRoute.route("/:id").get(validateObjectId, getOneStore);
storeRoute
  .route("/change-status/:id")
  .post(validateObjectId, changeStoreStatus);
storeRoute.route("/store-timeing/:id").get(validateObjectId, getStoreTiming);
storeRoute.route("/documents/:id").get(validateObjectId, getStoreDocuments);

export default storeRoute;
