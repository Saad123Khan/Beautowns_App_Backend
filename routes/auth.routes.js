import express from "express";
import { createUser,loginUser ,forgetPassword,otpVerify , logout,updatePassword} from "#controllers/auth.controller";
import { multerUpload } from '#utils/multer';

const authRoute = express.Router();

//Register User Auth
authRoute.post("/register",multerUpload.single('image'),createUser);

//login User Auth
authRoute.post("/",loginUser);

//Create Users
authRoute.post("/verify",otpVerify);

//logout User
authRoute.get("/logout",logout);

//Update Password
authRoute.put("/update-password",updatePassword);

//Forget Password
authRoute.post("/forget",forgetPassword);


export default authRoute;
