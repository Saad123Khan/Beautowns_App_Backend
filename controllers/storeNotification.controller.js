import AdminNotification from "#models/adminNotificationModel";
import { firebaseNotification } from "#utils/firebaseNotification";
import { User } from "#models/user_model";
import Notification from "#models/notificationModel";
import { Staffs } from "#models/staff_model";
import { Store } from "#models/store_model";
import asyncHandler from "#middlewares/asyncHandler";
import { LIVEPATH } from "#constant/constant";

/*
@desc     POST Notification Send
@route    GET /api/admin/notification-send
@access   Private
*/

const pushStoreNotification = asyncHandler(async (req, res) => {
  const store = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }
  console.log(req.body.target);

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/upload/${image}` : false;
  let notification = req.body.image
    ? {
        title: req.body.title,
        body: req.body.body,
        image: req.body.image,
      }
    : {
        title: req.body.title,
        body: req.body.body,
      };

  let users;
  if (req.body.target === "Users") {
    users = await User.find({ isDeleted: false, role: "user" });
  } 
  
  else if (req.body.target === "Specific-User") {
    users = await User.find({
      _id: { $in: req.body.userIds },
      role: "user",
      isDeleted: false,
    });
  } 
  
  else if (req.body.target === "Staffs") {
    
   let usersData = await Staffs.find({
      // isDeleted: false,
      // // role: "staff",
      store_Id: req.params.id,
    });
   let data=  usersData?.map((item)=>item.salon_staff_Id)
    users = await User.find({
      _id: { $in: data},
      role: "staff",
      // store_Id: req.params.id,
      isDeleted: false,
    });


  } else if (req.body.target === "Specific-Staff") {

    users = await User.find({
      _id: { $in: req.body.userIds},
      role: "staff",
      // store_Id: req.params.id,
      isDeleted: false,
    });


  } else {
    return res
      .status(400)
      .send({ status: false, message: "Invalid target type" });
  }

  console.log(users, "users");

  if (users?.length > 0) {
    await firebaseNotification(
      notification,
      users,
      req.body.type,
      req.body.target,
      req.body.from,
      req.body.to
    );

    await new AdminNotification({
      type: req.body.type,
      target: req.body.target,
      notification,
      userIds: req.body.userIds || [],
      from: req.body.from,
      to: req.body.to,
    }).save();

    return res
      .status(200)
      .send({ status: true, message: "Notification Send Sucessfully" });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something Error While Sending Notification",
    });
  }
});

const getStoreNotification = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    role: "store",
  });
  if (!user) {
    return res
      .status(200)
      .json({ status: false, message: "Staff not exists!" });
  }

  const notifications = await Notification.find({ userId: req.params.id }).sort(
    { createdAt: -1 }
  );
  const unSeenNotifications = await Notification.find({
    userId: req.params.id,
    isSeen: false,
  }).countDocuments();

  if (notifications?.length > 0) {
    return res
      .status(200)
      .json({ status: true, notifications, unSeenNotifications });
  } else {
    return res
      .status(200)
      .json({ status: true, notifications: [], unSeenNotifications: 0 });
  }
});

const StoreNotificationSeen = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    role: "store",
  });
  if (!user) {
    return res
      .status(200)
      .json({ status: false, message: "Record not exists!" });
  }

  const notifications = await Notification.updateMany(
    { userId: req.params.id, isSeen: false },
    { isSeen: true }
  );
  if (notifications) {
    return res
      .status(200)
      .json({ status: true, message: "Notification seen sucessfully" });
  } else {
    return res.status(404).json({ status: false, message: "Nothing to seen" });
  }
});

export { pushStoreNotification, getStoreNotification, StoreNotificationSeen };
