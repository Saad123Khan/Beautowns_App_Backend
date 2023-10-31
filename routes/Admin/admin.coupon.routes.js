import express from "express";
import { createdCoupon,getAllCoupons ,deletedCoupon,updateCoupon} from "#controllers/Admin/admin.coupons.controller";
import validateObjectId from "#middlewares/validateObjectId";
import authMiddleware from "#middlewares/auth.middleware";

const adminCouponRoute = express.Router();

adminCouponRoute.post("/", createdCoupon);

adminCouponRoute.get("/", getAllCoupons);

adminCouponRoute.delete("/delete/:id",[validateObjectId], deletedCoupon);

adminCouponRoute.put("/update/:id",[validateObjectId], updateCoupon);

export default adminCouponRoute;
