import express from "express";
import validateObjectId from "#middlewares/validateObjectId";
import authMiddleware from "#middlewares/auth.middleware";
import { getAllAnalytics ,getGraphsData } from "#controllers/Admin/admin.analytics.controller";

const analyticsRoute = express.Router();

analyticsRoute.get("/store_info/:id",[validateObjectId],getAllAnalytics);


analyticsRoute.get("/graph_info/:id",[validateObjectId],getGraphsData);


export default analyticsRoute;
