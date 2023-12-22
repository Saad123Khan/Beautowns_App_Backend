import express from "express";
import {
  getAllStore,
  getSingleStore,
} from "#controllers/Admin/admin.store.controller";
import validateObjectId from "#middlewares/validateObjectId";
import authMiddleware from "#middlewares/auth.middleware";

const adminStoreRoute = express.Router();

adminStoreRoute.get("/", getAllStore);
adminStoreRoute.get("/:id", validateObjectId, getSingleStore);

export default adminStoreRoute;
