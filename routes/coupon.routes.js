import express from "express";
import { validateCoupon} from "#controllers/coupon.controller";
import validateObjectId from "#middlewares/validateObjectId";
import authMiddleware from "#middlewares/auth.middleware";

const couponRoute = express.Router();

couponRoute.get("/validate/:id",[validateObjectId],validateCoupon);


export default couponRoute;
