import express from "express";
import validateObjectId from "#middlewares/validateObjectId";

import { getAllUser,getOneUser } from "#controllers/user.controller";
import authMiddleware from "#middlewares/auth.middleware";

const userRoute = express.Router();

//Get One User
userRoute.get("/:id",[validateObjectId,authMiddleware],getOneUser);



//Get All User
userRoute.get("/",[authMiddleware],getAllUser);


export default userRoute;
