import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import { LIVEPATH } from "#constant/constant";
import Notification from "#models/notificationModel";
import { Service } from "#models/services_model";
import { Store } from "#models/store_model";
import Joi from "joi";
import { Referral } from "#models/referral_modal";
import { generateRandomCode } from "#utils/generateRandomCode";

function validateUpdateUser(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    gender: Joi.string().valid("male", "female", "other"),
    image: Joi.string(),
  });

  return schema.validate(user);
}

//@desc  User Get All
//@route  /user
//@request Get Request
//@acess  private

const getAllUser = asyncHandler(async (req, res) => {
  const user = await User.find({}).select(
    "role email image name phone isVerified"
  );
  if (user?.length > 0) {
    return res.status(200).json({
      status: true,
      user,
    });
  } else {
    return res
      .status(200)
      .json({ status: true, message: "User record not found" });
  }
});

//@desc  User Get One
//@route  /user/:id
//@request Get Request
//@acess  private

const getOneUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "role email name image phone isVerified"
  );
  if (user) {
    return res.status(200).json({
      status: true,
      user,
    });
  } else {
    return res
      .status(200)
      .json({ status: true, message: "User record not found" });
  }
});

//@desc  User Get One
//@route  /user/:id
//@request Get Request
//@acess  private

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });
  if (user) {
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res
        .status(400)
        .send({ status: false, message: error?.details[0]?.message });
    }

    const image = req?.file?.filename;
    req.body.image = image ? `${LIVEPATH}/uploads/${image}` : user?.image;

    const updaingUser = await User.findByIdAndUpdate(user?._id, req.body, {
      new: true,
    }).select("role email image name phone isVerified");

    if (updaingUser) {
      return res.status(200).send({
        status: true,
        message: `Sucessfully updated ${user?.role}`,
        updaingUser,
      });
    } else {
      return res.status(400).json({
        status: true,
        message: `Something wents wrong while updating ${user?.role}`,
      });
    }
  } else {
    return res
      .status(200)
      .json({ status: true, message: "User record not found" });
  }
});

//@desc  User Update token
//@route  /user/:id
//@request Post Request
//@acess  private

const updateUserProfileToken = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userFind = await User.findById(id);

  req.body.not_token =
    req.body.not_token && req.body.not_token != ""
      ? req.body.not_token
      : userFind?.not_token;

  const user = await User.findByIdAndUpdate(
    id,
    { not_token: req.body.not_token },
    { new: true }
  ).populate("favourite.stores favourite.services");
  
  await User.populate(user, {
    path: "favourite.services",
    populate: {
      path: "store_Id",
      model: "Store",
    },
  });

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
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    role: "user",
  });
  if (!user) {
    return res.status(200).json({ status: false, message: "User not exists!" });
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

//@desc  User Seen Notification
//@route  /user/notification-seen/:id
//@request Get Request
//@acess  private

const userNotificationSeen = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    role: "user",
  });
  if (!user) {
    return res.status(200).json({ status: false, message: "User not exists!" });
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

//@desc  Add Favourite
//@route  /user/favourite-added/:id
//@request Body Request
//@acess  private

const addFavouriteSalonServices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, store_Id, service_Id } = req.body;

  const user = await User.findOne({ _id: id, isDeleted: false, role: "user" });

  if (!user) {
    return res.status(200).json({ status: false, message: "User not exists!" });
  }

  let updateFields;

  if (type === "store") {
    const salonFind = await Store.findOne({
      _id: store_Id,
      isDeleted: false,
      isSuspend: false,
    });

    if (!salonFind) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Store Id" });
    }

    updateFields = { $addToSet: { "favourite.stores": store_Id } };
  } else if (type === "service") {
    const serviceFind = await Service.findOne({
      _id: service_Id,
      isDeleted: false,
      isSuspend: false,
    });

    if (!serviceFind) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Service Id" });
    }

    updateFields = { $addToSet: { "favourite.services": service_Id } };
  } else {
    return res.status(400).json({ status: false, message: "Invalid type!" });
  }

  const userUpdate = await User.findByIdAndUpdate(user?._id, updateFields, {
    new: true,
  })
    .select("role email name phone gender isVerified favourite")
    .populate("favourite.stores favourite.services");
  await User.populate(userUpdate, {
    path: "favourite.services",
    populate: {
      path: "store_Id",
      model: "Store",
    },
  });

  if (userUpdate) {
    return res.status(200).json({
      status: true,
      message: "Favourite Added Successfully",
      user: userUpdate,
    });
  } else {
    return res.status(400).json({
      status: false,
      message: "Something went wrong while adding favourites",
    });
  }
});

const getUserReferral = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id,role:"user", isDeleted: false })
  if (!user) {
    return res.status(200).json({ status: false, message: "User not exists!" });
  }
  
  const referralFind = await Referral.find({ from_referral_userId: user?._id}).populate("from_referral_userId to_referral_userId");
  
  const totalAmountReward = referralFind?.reduce((acc,obj)=>acc+=obj.rewarded_amount,0)
  
  referralFind?.length === 0
    ? res
      .status(200)
      .send({ status: false, message: "Referral does not exist", referral: [] })
    : res.status(200).send({ status: true, referral: referralFind,totalReferral:totalAmountReward });

})


const userReferralLinkGenerated = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false })
  if (!user) {
    return res.status(404).json({ status: false, message: "User not exists!" });
  }
  
  console.log(user)
  if (user?.referralCode) {
    return res.status(200).json({ status: true, message: "ReferralLink already generated", user });
  }

  const userReferralId = await generateRandomCode(user?.name)

  const userUpdate = await User.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { referralCode: userReferralId },{ new : true});
  if (userUpdate) {
    return res.status(200).json({ status: true, message: "Your referral link has been generated", user: userUpdate });
  }
  else {
    return res.status(404).json({ status: false, message: "Something error while generating referralLink" });
  }
})

export {
  userReferralLinkGenerated,
  getUserReferral,
  addFavouriteSalonServices,
  getOneUser,
  getAllUser,
  updateUserProfileToken,
  getUserNotification,
  userNotificationSeen,
  updateUser,
};
