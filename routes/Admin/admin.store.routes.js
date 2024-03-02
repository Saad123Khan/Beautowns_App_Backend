import express from "express";
import {
  getAllStore,
  getCompleteAdmin,
  suspendStore,
  getCompleteStore,
} from "#controllers/Admin/admin.store.controller";
import validateObjectId from "#middlewares/validateObjectId";
import authMiddleware from "#middlewares/auth.middleware";

const adminStoreRoute = express.Router();

adminStoreRoute.get("/", getAllStore);
adminStoreRoute.get("/:id", getCompleteStore);
adminStoreRoute.get("/complete-admin/:id", validateObjectId, getCompleteAdmin);
adminStoreRoute.delete("/:id", validateObjectId, suspendStore);

export default adminStoreRoute;
