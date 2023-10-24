/*****  Packages  *****/
import Joi from "joi";
import bcrypt from "bcryptjs";
import _ from "lodash";
import otpGenerator from "otp-generator";

/*****  Modules  *****/
import {
  UserVerification,
  validateUserVerification,
} from "#models/user_verification_model";
import asyncHandler from "#middlewares/asyncHandler";
import { email } from "#utils/email";
import { User, validateUser } from "#models/user_model";
import { Store } from "#models/store_model";
const validate = (req) => {
  const schema = Joi.object({
    role: Joi.string().valid("user", "admin", "store", "staff").required(),
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(255).required(),
  });

  return schema.validate(req);
};
const validateForget = (req) => {
  const schema = Joi.object({
    role: Joi.string().valid("user", "admin", "store", "staff").required(),
    email: Joi.string().required().email(),
  });

  return schema.validate(req);
};
/**
 @desc     Authenticate User Registered
 @route    POST /api/auth/register
 @access   Public
 */

const createUser = asyncHandler(async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res
      .status(400)
      .send({ status: false, message: "Email already exists." });
  } else {
    await new User(
      _.pick(req.body, ["role", "name","gender", "email", "password"])
    ).save();
  }

  await UserVerification.deleteMany({ email: req.body.email });

  let OTP = otpGenerator.generate(4, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  let verification = await new UserVerification({
    email: req.body.email,
    otp: OTP,
  }).save();

  email(verification?.email, OTP);

  return res.status(200).json({
    status: true,
    message: "We have sent you an OTP via email for verification.!",
  });
});

/**
 @desc     Authenticate User Login
 @route    POST /api/auth
 @access   Public
 */

// const loginUser = asyncHandler(async (req, res) => {
//   const { error } = validate(req.body);

//   if (error) {
//     return res
//       .status(400)
//       .send({ status: false, message: error?.details[0]?.message });
//   }

//   let user = await User.findOne({ email: req.body.email, role: req.body.role });
  
//   if (!user)
//     return res
//       .status(404)
//       .send({ status: false, message: "Invalid email or password." });

//       console.log(req.body.password)
//       console.log(user?.password)

// const validPassword = await bcrypt.compareSync(req.body.password, user?.password);

//   if (!validPassword)
//     return res
//       .status(404)
//       .send({ status: false, message: "Invalid email or password." });

//   if (user?.isVerified === false) {
//     await UserVerification.deleteMany({ email: req.body.email });

//     let OTP = otpGenerator.generate(4, {
//       digits: true,
//       upperCaseAlphabets: false,
//       lowerCaseAlphabets: false,
//       specialChars: false,
//     });

//     let verification = await new UserVerification({
//       email: req.body.email,
//       otp: OTP,
//     }).save();
    
//     email(verification?.email, OTP);

//     return res.status(404).json({
//       status: true,
//       message: "We have sent you an OTP via email for verification.!",
//     });
//   }

//   let updatedUser = await User.findOne({ email: req.body.email }).select(
//     "role email name phone gender isVerified"
//   );
//   const token = updatedUser.generateAuthToken();

//   return res
//     .cookie("x-auth-token", token, {
//       httpOnly: true,
//       maxAge: 365 * 24 * 60 * 60 * 1000,
//     }) 
//     .header("x-auth-token", token)
//     .header("access-control-expose-headers", "x-auth-token")
//     .status(200)
//     .send({
//       status: true,
//       message: `Login successfully`,
//       user: updatedUser,
//     });
// });



const loginUser = asyncHandler(async (req, res) => {
  const { error } = validate(req.body);

  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  let user = await User.findOne({ email: req.body.email, role: req.body.role });

  if (!user)
    return res
      .status(404)
      .send({ status: false, message: "Invalid email or password." });
  const validPassword = await bcrypt.compareSync(
    req.body.password,
    user?.password
  );


  if (!validPassword)
    return res
      .status(404)
      .send({ status: false, message: "Invalid email or password." });

  if (user?.isVerified === false) {
    await UserVerification.deleteMany({ email: req.body.email });

    let OTP = otpGenerator.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let verification = await new UserVerification({
      email: req.body.email,
      otp: OTP,
    }).save();
    email(verification?.email, OTP);

    return res.status(404).json({
      status: true,
      message: "We have sent you an OTP via email for verification.!",
    });
  }

  const isStoreExist = await Store.findOne({
    salon_owner_Id: user?._id,
    isDeleted: false,
    isSuspend: false,
  });

  let updatedUser = await User.findOne({ email: req.body.email }).select(
    "role email name phone gender isVerified"
  );
  const token = updatedUser.generateAuthToken();

  return res
    .cookie("x-auth-token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    })
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .status(200)
    .send({
      status: true,
      message: `Login successfully`,
      user: updatedUser,
      store:isStoreExist
    });
});


//@desc  User forget password
//@route  /auth/forget
//@request post Request
//@acess  public

const forgetPassword = asyncHandler(async (req, res) => {
  const { error } = validateForget(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  let user = await User.findOne({ email: req.body.email, role: req.body.role });
  if (!user)
    return res
      .status(404)
      .send({ status: false, message: "Email does not exists." });

  await UserVerification.deleteMany({ email: req.body.email });

  let OTP = otpGenerator.generate(4, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  let verification = await new UserVerification({
    email: req.body.email,
    otp: OTP,
  }).save();

  email(verification?.email, OTP);

  return res.status(200).json({
    status: true,
    message: "We have sent you an OTP via email for verification.!",
  });
});

//@desc  User Update password
//@route  /auth/update-password
//@request put Request
//@acess  public

const updatePassword = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { error } = validate(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  let user = await User.findOne({ role: req.body.role, email: req.body.email });
  if (!user)
    return res
      .status(404)
      .send({ status: false, message: "Email does not exists." });

  const salt = await bcrypt.genSalt(10);
  let password = await bcrypt.hash(req.body.password, salt);

  await User.findOneAndUpdate(
    { role: req.body.role, email: req.body.email },
    { password: password }
  );

  return res.status(200).json({
    status: true,
    message: "Password updated successfully!",
  });
});

//@desc  User otp verify
//@route  /auth/verify
//@request post Request
//@acess  public

const otpVerify = asyncHandler(async (req, res) => {
  const { error } = validateUserVerification(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  const emailValid = await User.findOne({ email: req.body.email }).select(
    "role email name phone isVerified"
  );
  if (!emailValid) {
    return res
      .status(404)
      .send({ status: false, message: "Email does not exists" });
  }

  const otpFind = await UserVerification.findOne({ email: req.body.email });

  if (!otpFind)
    return res
      .status(404)
      .send({ status: false, message: "You use an expired OTP!" });

  if (otpFind?.otp === req.body.otp) {
    await UserVerification.deleteMany({ email: req.body.email });

    const user = await User.findOneAndUpdate(
      { email: emailValid?.email },
      { $set: { isVerified: true } },
      { new: true }
    ).select("role email name phone isVerified");

    const token = user.generateAuthToken();

    return res
      .cookie("x-auth-token", token, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      }) // maxAge expire after 1 hour
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .status(200)
      .send({
        status: true,
        message: "Verified successfully",
        user: user,
      });
  } else {
    return res.status(404).send({ status: false, message: "Otp was wrong!" });
  }
});

/**
 @desc     Clear Cookies
 @route    GET /api/auth/logout
 @access   Public
 */

const logout = asyncHandler(async (req, res) => {
  res.cookie("x-auth-token", null).send("Successfully logout");
});

export {
  createUser,
  loginUser,
  otpVerify,
  logout,
  forgetPassword,
  updatePassword,
};
