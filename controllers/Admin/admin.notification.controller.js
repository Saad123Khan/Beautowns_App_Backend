import AdminNotification from "#models/adminNotificationModel";
import { firebaseNotification } from "#utils/firebaseNotification";
import { User } from "#models/user_model";
import asyncHandler from "#middlewares/asyncHandler";
import { PATH } from "#constant/constant";

/*
@desc     POST Notification Send
@route    GET /api/admin/notification-send
@access   Private
*/
const sendPushNotification = asyncHandler(async (req, res) => {

    const image = req?.file?.filename;
    req.body.image = image ? `${PATH}/upload/${image}` : false;
  
  
    let notification = req.body.image ? {
      title: req.body.title,
      body: req.body.body,
      image: req.body.image
    } : {
      title: req.body.title,
      body: req.body.body,
    };
  
    let users;
    if (req.body.target === "Users") {
      users = await User.find({ isDeleted: false , role:'user'});
    }
    else if (req.body.target === "Salons") {
      users = await User.find({ isDeleted: false, role:'store' });
    }
    else if (req.body.target === "Staffs") {
      users = await User.find({ isDeleted: false, isInvestor: false });
    }
  
    else if (req.body.target === "Specific-User") {
      users = await User.find({
        _id: { $in: req.body.userIds },
       role:'user',
        isDeleted: false
      });
    }
    else if (req.body.target === "Specific-Salon") {
        users = await User.find({
          _id: { $in: req.body.userIds },
          role:'store',
          isDeleted: false
        });
      }
      
    else if (req.body.target === "Specific-Staff") {
        users = await User.find({
          _id: { $in: req.body.userIds },
          role:'staff',
          isDeleted: false
        });
      }
    else {
      return res
        .status(400)
        .send({ status: false, message: "Invalid target type" });
    }
  
    console.log(users)
    console.log(notification.body)
    console.log(notification.title)
    // console.log(notification.image)
  
    if (users?.length > 0) {
      await firebaseNotification(
        notification,
        users,
        req.body.type,
        req.body.target,
        req.body.from,
        req.body.to
      )
  
  
      await new AdminNotification({
        type: req.body.type,
        target: req.body.target,
        notification,
        userIds: req.body.userIds || []
      }).save();
  
      return res
        .status(200)
        .send({ status: true, message: "Notification Send Sucessfully" });
    }
    else {
      return res
        .status(400)
        .send({ status: false, message: "Something Error While Sending Notification" });
  
    }
  
  });


  
const getAdminNotificationHistory = asyncHandler(async (req, res) => {

  const notifications = await AdminNotification.find({}).sort({ createdAt: -1 })

  if (notifications?.length > 0) {
    return res.status(200).json({ status: true, notifications });
  }
  else {
    return res.status(200).json({ status: true, notifications: [] });
  }
})


export {sendPushNotification,getAdminNotificationHistory}