import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";

//@desc  User Get All
//@route  /user
//@request Get Request
//@acess  private

const getAllUser = asyncHandler(async (req, res) => {

  const user = await User.find({}).select('role email name phone isVerified');
  if (user) {
    return res.status(200).json({
      status: true,
      user
    })}
  else {
    return res.status(200).json({ status: true, message: "User record not found" });
  }
});

//@desc  User Get One
//@route  /user/:id
//@request Get Request
//@acess  private

const getOneUser = asyncHandler(async (req, res) => {

  const user = await User.findById(req.params.id).select('role email name phone isVerified');
  if (user) {
    return res.status(200).json({
      status: true,
      user
    })}
  else {
    return res.status(200).json({ status: true, message: "User record not found" });
  }
});

export {getOneUser,getAllUser}