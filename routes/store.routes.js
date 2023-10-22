import express from "express";
import {
  createStore,
  getAllStore,
  getOneStore,
  changeStoreStatus,
  updateStore
} from "#controllers/store.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const storeRoute = express.Router();

storeRoute
  .route("/")
  .post(multerUpload.single("image"), createStore)
  .get(getAllStore);


storeRoute
  .route("/update/:id")
  .put(validateObjectId, multerUpload.fields(
    [{
      name: 'image', maxCount: 1
    },
     {
      name: 'gallery', maxCount: 30
    },
    {
      name: 'documents', maxCount: 10
    }
    ]
  ), updateStore);


storeRoute.route("/:id").get(validateObjectId, getOneStore);

storeRoute
  .route("/change-status/:id")
  .post(validateObjectId, changeStoreStatus);


export default storeRoute;
