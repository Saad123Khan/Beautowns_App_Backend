import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import Notification from "#models/notificationModel";

//@desc  User Get All
//@route  /user
//@request Get Request
//@acess  private

const getAllUser = asyncHandler(async (req, res) => {

  const user = await User.find({}).select('role email name phone isVerified');
  if (user?.length > 0) {
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

//@desc  User Update token
//@route  /user/:id
//@request Post Request
//@acess  private

const updateUserProfileToken = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const userFind = await User.findById(id);

  req.body.not_token = req.body.not_token && req.body.not_token != "" ? req.body.not_token : userFind?.not_token;

  const user = await User.findByIdAndUpdate(id, { not_token: req.body.not_token }, { new: true });

  if (user) {
    res.status(200).json({
      status: true,
      user: user,
    });
  }
});

//@desc  User Get Notification
//@route  /user/notification/:id
//@request Get Request
//@acess  private


const getUserNotification = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false , role:'user'})
  if (!user) {
    return res.status(200).json({ status: false, message: "User not exists!" });
  }

  const notifications = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 })
  const unSeenNotifications = await Notification.find({ userId: req.params.id, isSeen: false }).countDocuments()

  if (notifications?.length > 0) {
    return res.status(200).json({ status: true, notifications, unSeenNotifications });
  }
  else {
    return res.status(200).json({ status: true, notifications: [], unSeenNotifications: 0 });
  }
})

//@desc  User Seen Notification
//@route  /user/notification-seen/:id
//@request Get Request
//@acess  private

const userNotificationSeen = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false ,role:'user'})
  if (!user) {
    return res.status(200).json({ status: false, message: "User not exists!" });
  }

  const notifications = await Notification.updateMany({ userId: req.params.id, isSeen: false }, { isSeen: true })
  if (notifications) {
    return res.status(200).json({ status: true, message: "Notification seen sucessfully" });
  }
  else {
    return res.status(404).json({ status: false, message: "Nothing to seen" });
  }
})


export {getOneUser,getAllUser,updateUserProfileToken,getUserNotification,userNotificationSeen}