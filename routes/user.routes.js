import express from "express";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";
import {
  addFavouriteSalonServices,
  getAllUser,
  getOneUser,
  updateUser,
  updateUserProfileToken,
  getUserNotification,
  userNotificationSeen,
  getUserReferral,
  userReferralLinkGenerated
} from "#controllers/user.controller";
import authMiddleware from "#middlewares/auth.middleware";

const userRoute = express.Router();

//Get One User
userRoute.get("/:id", [validateObjectId, authMiddleware], getOneUser);



//Create referral 
userRoute.post("/referral/:id",[authMiddleware],userReferralLinkGenerated);


//Get Referral User
userRoute.get("/referral/:id", [validateObjectId, authMiddleware], getUserReferral);

//Get All User
userRoute.get("/", [authMiddleware], getAllUser);

userRoute.put(
  "/update/:id",
  [validateObjectId, authMiddleware, multerUpload.single("image")],
  updateUser
);

//Get User Notification

userRoute.get("/notification/:id", [authMiddleware], getUserNotification);

//Add Favourites Salon and Services

userRoute.post(
  "/favourite-add/:id",
  [authMiddleware],
  addFavouriteSalonServices
);

//Seen User Notification

userRoute.get("/notification-seen/:id", [authMiddleware], userNotificationSeen);

//Update User Profile Token
userRoute.post(
  "/update-token/:id",
  [authMiddleware, validateObjectId],
  updateUserProfileToken
);

export default userRoute;
