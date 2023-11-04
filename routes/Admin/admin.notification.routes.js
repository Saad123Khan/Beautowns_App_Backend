import express from "express";
import { sendPushNotification,getAdminNotificationHistory} from "#controllers/Admin/admin.notification.controller";
import { multerUpload } from "#utils/multer";

const adminNotificationRoute = express.Router();

adminNotificationRoute.post("/",multerUpload.single('image'), sendPushNotification);

adminNotificationRoute.get("/", getAdminNotificationHistory);


export default adminNotificationRoute;
