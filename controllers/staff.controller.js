import asyncHandler from "#middlewares/asyncHandler";
import { Staffs, validateStaff } from "#models/staff_model";
import { Store } from "#models/store_model";
import { User } from "#models/user_model";
import _ from "lodash";
import bcrypt from "bcryptjs";
import { Booking } from "#models/booking_model";
import { PATH, LIVEPATH } from "#constant/constant";
import Joi from "joi";
import Notification from "#models/notificationModel";
import { Referral } from "#models/referral_modal";
import { generateRandomCode } from "#utils/generateRandomCode";

function validateUpdatedStaff(service) {
  const schema = Joi.object({
    store_Id: Joi.string(),
    salon_staff_Id: Joi.string(),
    title: Joi.string(),
    name: Joi.string(),
    gender: Joi.string().valid("male", "female", "other"),
    description: Joi.string(),

    phone: Joi.number(),
    workingSchedule: Joi.array()
      .items(
        Joi.object({
          day: Joi.string()
            .valid(
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            )
            .required(),
          from: Joi.string()
            .regex(/^([0-9]|1[0-2]|0[0-9]):[0-5][0-9][ap]m$/i)
            .required(),
          to: Joi.string()
            .regex(/^([0-9]|1[0-2]|0[0-9]):[0-5][0-9][ap]m$/i)
            .required(),
          isAvailable: Joi.boolean().required(),
        })
      )
      .min(7)
      .max(7)
      .unique("day", { ignoreUndefined: true }),
    image: Joi.string(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });
  return schema.validate(service);
}

const createSalonStaff = asyncHandler(async (req, res) => {
  const { email, password, ...rest } = req.body;

  const { error } = validateStaff(rest);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const store = await Store.findOne({
    _id: req.body.store_Id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/uploads/${image}` : "";

  let createStaff = await User.findOne({
    email: req.body.email,
    isDeleted: false,
    isSuspend: false,
  });
  if (createStaff) {
    return res
      .status(400)
      .send({ status: false, message: "Email already exists." });
  } else {
    req.body.role = "staff";
    createStaff = await new User(
      _.pick(req.body, ["role", "name", "gender", "email", "password", "image"])
    ).save();
  }

  req.body.salon_staff_Id = createStaff?._id;

  const staff = await new Staffs(req.body).save();
  if (staff) {
    return res
      .status(201)
      .send({ status: true, message: "Sucessfully created Staff", staff });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Something error while creating Staff" });
  }
});

const updateStaff = asyncHandler(async (req, res) => {
  const { error } = validateUpdatedStaff(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const isStaffExist = await Staffs.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStaffExist) {
    return res.status(400).send({ status: false, message: "Staff not exist" });
  }
  let updatedStaff = await Staffs.findByIdAndUpdate(
    isStaffExist?._id,
    _.pick(req.body, [
      "name",
      "phone",
      "title",
      "description",
      "image",
      "gender",
      "workingSchedule",
    ]),
    { new: true }
  );
  return res.status(200).send({
    status: true,
    message: "Updated staff details successfully",
    staff: updatedStaff,
  });
});

const getAllStoreStaffs = asyncHandler(async (req, res) => {
  console.log(req.params.id);
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

  const staff = await Staffs.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("salon_staff_Id", "name isDeleted");
  if (staff?.length > 0) {
    return res.status(200).send({ status: true, staff });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Staff does not exists", staff: [] });
  }
});

const getOneStaff = asyncHandler(async (req, res) => {
  const staff = await Staffs.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (staff) {
    return res.status(200).send({ status: true, staff });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Staff does not exists" });
  }
});

const delete_staff = asyncHandler(async (req, res) => {
  const isStaffExist = await Staffs.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStaffExist) {
    return res.status(400).send({ status: false, message: "Staff not exist" });
  }

  const delete_cat = await Staffs.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { isDeleted: true } }
  );

  if (delete_cat) {
    return res
      .status(200)
      .send({ status: true, message: "Staff Deleted Successfully!" });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Staff does not exists" });
  }
});

const changeStaffStatus = asyncHandler(async (req, res) => {
  const isStaffExist = await Staffs.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("salon_staff_Id");

  if (!isStaffExist) {
    return res.status(400).send({ status: false, message: "Staff not exist" });
  }

  const change_status = await User.findOneAndUpdate(
    { _id: isStaffExist?.salon_staff_Id?._id },
    { $set: { isDeleted: !isStaffExist?.salon_staff_Id?.isDeleted } }
  );

  if (change_status) {
    return res
      .status(200)
      .send({ status: true, message: "Changed staff status successfully!" });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Staff does not exists" });
  }
});

const staffNotificationSeen = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    role: "staff",
  });
  if (!user) {
    return res
      .status(200)
      .json({ status: false, message: "Staff not exists!" });
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

const getStaffNotification = asyncHandler(async (req, res) => {
  // const isStaffExist = await Staffs

  const user = await Staffs.findOne({
    salon_staff_Id: req.params.id,
    isDeleted: false,
    // role: "staff",
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

const getStaffReferral = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    role: "staff",
    isDeleted: false,
  });
  if (!user) {
    return res
      .status(200)
      .json({ status: false, message: "Staff not exists!" });
  }

  const referralFind = await Referral.find({
    from_referral_userId: user?._id,
  }).populate("from_referral_userId to_referral_userId");

  const totalAmountReward = referralFind?.reduce(
    (acc, obj) => (acc += obj.rewarded_amount),
    0
  );

  referralFind?.length === 0
    ? res.status(200).send({
        status: false,
        message: "Referral does not exist",
        referral: [],
      })
    : res.status(200).send({
        status: true,
        referral: referralFind,
        totalReferral: totalAmountReward,
      });
});

const staffReferralLinkGenerated = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false });
  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "Staff owner not exists!" });
  }

  console.log(user);
  if (user?.referralCode) {
    return res.status(200).json({
      status: true,
      message: "ReferralLink already generated",
      staff: user,
    });
  }

  const userReferralId = await generateRandomCode(user?.name);

  const userUpdate = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { referralCode: userReferralId },
    { new: true }
  );
  if (userUpdate) {
    return res.status(200).json({
      status: true,
      message: "Your referral link has been generated",
      staff: userUpdate,
    });
  } else {
    return res.status(404).json({
      status: false,
      message: "Something error while generating referralLink",
    });
  }
});

const getStaffAnalytics = asyncHandler(async (req, res) => {
  const allBookings = await Booking.find({ salon_staff_Id: req.params.id });
  let totalAppointments = 0;
  let completedAppointments = 0;
  let notCompletedAppointments = 0;
  let cancelledAppointments = 0;
  let onlineAppointments = 0;
  let onSiteAppointments = 0;
  let totalSales = 0;
  let totalDiscount = 0;
  let totalRating = 0;
  let totalCheckIns = 0;
  let paymentCompletedNotCheckInAppointments = 0;
  let totalWithStaffAppointments = 0;
  let returningClients = 0;
  let newClients = 0;

  let totalPendingSales = 0;

  let totalPendingDiscount = 0;

  const uniqueUserIds = new Set();
  const returningClientUserIds = new Set();

  allBookings?.forEach((booking) => {
    console.log(booking);
    if (!booking.isSessionExpired && booking.paymentDone) {
      totalAppointments++;

      if (booking.user_Id) {
        uniqueUserIds.add(booking.user_Id);
        // Check for returning clients
        if (uniqueUserIds.has(booking.user_Id)) {
          returningClients++;
          returningClientUserIds.add(booking.user_Id);
        } else {
          newClients++;
        }
      }

      if (booking.isCancel) {
        cancelledAppointments++;
      }

      if (booking.paymentDone && booking.isCheckIn) {
        completedAppointments++;
        totalSales += booking.amount;

        if (booking.coupons_Id) {
          totalDiscount += booking.discount;
        }
      }

      if (booking.paymentDone && !booking.isCheckIn) {
        paymentCompletedNotCheckInAppointments++;
        notCompletedAppointments++;
        totalPendingSales += booking.amount;

        if (booking.coupons_Id) {
          totalPendingDiscount += booking.discount;
        }
      }

      if (booking.isCheckIn) {
        totalCheckIns++;
      }
      if (booking.booking_type === "auto") {
        onlineAppointments++;
      }
      if (booking.salon_staff_Id) {
        totalWithStaffAppointments++;
      }

      if (booking.booking_type === "manual") {
        onSiteAppointments++;
      }

      if (booking.rating) {
        totalRating += booking.rating;
      }
    }
  });

  const averageSale =
    totalAppointments - cancelledAppointments > 0
      ? totalSales / (totalAppointments - cancelledAppointments)
      : 0;

  const averageRating =
    totalAppointments > 0
      ? totalRating > 0
        ? totalRating / totalAppointments
        : 0
      : 0;

  const percentageCompletedAppointments =
    totalAppointments > 0
      ? (completedAppointments / totalAppointments) * 100
      : 0;

  const percentageNotCompletedAppointments =
    totalAppointments > 0
      ? (notCompletedAppointments / totalAppointments) * 100
      : 0;

  const percentageCancelledAppointments =
    totalAppointments > 0
      ? (cancelledAppointments / totalAppointments) * 100
      : 0;

  const percentageOnlineAppointments =
    totalAppointments > 0 ? (onlineAppointments / totalAppointments) * 100 : 0;

  const percentageOnSiteAppointments =
    totalAppointments > 0 ? (onSiteAppointments / totalAppointments) * 100 : 0;

  const percentagePaymentCompletedNotCheckInAppointments =
    totalAppointments > 0
      ? (paymentCompletedNotCheckInAppointments / totalAppointments) * 100
      : 0;

  const clientRetention =
    uniqueUserIds.size > 0
      ? (returningClientUserIds.size / uniqueUserIds.size) * 100
      : 0;

  const percentageReturningClients =
    uniqueUserIds.size > 0
      ? (returningClientUserIds.size / uniqueUserIds.size) * 100
      : 0;

  const analyticsData = {
    totalAppointments,
    completedAppointments,
    percentageCompletedAppointments,
    paymentCompletedNotCheckInAppointments,
    percentagePaymentCompletedNotCheckInAppointments,
    notCompletedAppointments,
    percentageNotCompletedAppointments,
    cancelledAppointments,
    percentageCancelledAppointments,
    totalWithStaffAppointments,
    onlineAppointments,
    percentageOnlineAppointments,
    onSiteAppointments,
    percentageOnSiteAppointments,
    totalSales,
    totalPendingDiscount,
    totalPendingSales,
    averageSale,
    averageRating,
    totalDiscount,
    totalCheckIns,
    clientRetention,
    returningClients,
    newClients,
    percentageReturningClients,
  };

  return res.status(200).json(analyticsData);
});

const getStaffGraph = asyncHandler(async (req, res) => {
  const requestedYear = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  const allBookings = await Booking.find({
    salon_staff_Id: req.params.id,
  }).populate({
    path: "service_Ids",
    populate: { path: "service_category_Id" },
  });

  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 11);

  const monthlyEarnings = Array(12).fill(0);
  const yearlyEarnings = {};
  const categoryCounts = {};
  const categoryCountsPercentage = {};
  const monthlyBookingCounts = Array(12).fill(0);
  const staffBookingCounts = {};
  const staffBookingPercentage = {};
  const serviceCounts = {};
  const servicePercentage = {};
  let totalBookings = 0;

  for (const booking of allBookings) {
    const bookingDate = new Date(booking.createdAt);

    if (booking.paymentDone && booking.isCheckIn) {
      totalBookings++;
      // Monthly Earnings
      if (bookingDate.getFullYear() === requestedYear) {
        const monthDifference = currentDate.getMonth() - bookingDate.getMonth();
        const monthIndex = 11 - monthDifference;

        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyEarnings[monthIndex] += booking.amount;
          monthlyBookingCounts[monthIndex]++;
        }
      }

      // Yearly Earnings
      if (!yearlyEarnings[bookingDate.getFullYear()]) {
        yearlyEarnings[bookingDate.getFullYear()] = 0;
      }
      yearlyEarnings[bookingDate.getFullYear()] += booking.amount;
    }
  }

  const analyticsData = {
    monthlyEarnings,
    monthlyBookingCounts,
    yearlyEarnings,
    categoryCounts,
    staffBookingCounts,
    serviceCounts,
    servicePercentage,
    categoryCountsPercentage,
    staffBookingPercentage,
  };

  return res.status(200).json(analyticsData);
});

const completeStaffData = asyncHandler(async (req, res) => {
  let bookings;
  let referral;
  let notifications;
  let staffInfo;
  let analytics;
  let graph;

  const isStaffExist = await Staffs.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("salon_staff_Id");

  if (!isStaffExist) {
    return res.status(400).send({ status: false, message: "Staff not exist" });
  } else {
    staffInfo = isStaffExist;
  }

  const staffbooking = await Booking.find({
    salon_staff_Id: req.params.id,
    isDeleted: false,
    isSessionExpired: false,
  })
    .populate("service_Ids salon_staff_Id store_Id")
    .populate({ path: "user_Id", select: "name gender phone" });

  if (staffbooking?.length > 0) {
    bookings = staffbooking;
  }

  const staffNotifications = await Notification.find({
    userId: isStaffExist?.salon_staff_Id._id,
  }).sort({ createdAt: -1 });

  if (staffNotifications?.length > 0) {
    notifications = staffNotifications;
  }

  const referralFind = await Referral.find({
    from_referral_userId: isStaffExist?.salon_staff_Id._id,
  }).populate("from_referral_userId to_referral_userId");
  if (referralFind) {
    referral = referralFind;
  }

  const totalAmountReward = referralFind?.reduce(
    (acc, obj) => (acc += obj.rewarded_amount),
    0
  );


  // getStaffGraph({},req.params.id)
  // getStaffAnalytics({},req.params.id)

  const staffData={
    bookings,
    referral,
    notifications,
    totalAmountReward,
    staffInfo,
    analytics,
    graph
  }

  return res.status(200).json(staffData);
});

export {
  staffReferralLinkGenerated,
  getStaffReferral,
  createSalonStaff,
  getAllStoreStaffs,
  getOneStaff,
  updateStaff,
  delete_staff,
  staffNotificationSeen,
  getStaffNotification,
  changeStaffStatus,
  getStaffAnalytics,
  getStaffGraph,
  completeStaffData
};
