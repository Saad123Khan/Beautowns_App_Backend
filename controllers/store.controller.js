import asyncHandler from "#middlewares/asyncHandler";
import { Store, validateStores } from "#models/store_model";
import AdminNotification from "#models/adminNotificationModel";
import { firebaseNotification } from "#utils/firebaseNotification";
import { LIVEPATH } from "#constant/constant";
import { Service } from "#models/services_model";
import { Marketing } from "#models/marketing_model";
import { Coupon } from "#models/coupons_model";
import { StoreCoupon } from "#models/store_coupon_model";
import { Blog } from "#models/blogs_model";
import { Staffs } from "#models/staff_model";
import Notification from "#models/notificationModel";
import { Booking } from "#models/booking_model";
import { StaffPayroll } from "#models/staff_payroll_model";
import _ from "lodash";
import { User } from "#models/user_model";
import { Categories } from "#models/category_model";
import Joi from "joi";
import { Payment } from "#models/payment_model";
import { Referral } from "#models/referral_modal";
import { generateRandomCode } from "#utils/generateRandomCode";
import { StoreCategories } from "#models/store_categories_model";

function validateUpdateStores(store) {
  const schema = Joi.object({
    name: Joi.string(),
    country: Joi.string(),
    city: Joi.string(),
    phone: Joi.number(),
    latitude: Joi.number(),
    longitude: Joi.number(),
    category_Ids: Joi.array(),
    no_of_slots: Joi.number(),
    details: Joi.string(),
    location: Joi.string(),
    store_timings: Joi.array()
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
          from: Joi.when("isAvailable", {
            is: true,
            then: Joi.string()
              .regex(/^([0-9]|1[0-2]|0[0-9]):[0-5][0-9][ap]m$/i)
              .required(),
          }),
          to: Joi.when("isAvailable", {
            is: true,
            then: Joi.string()
              .regex(/^([0-9]|1[0-2]|0[0-9]):[0-5][0-9][ap]m$/i)
              .required(),
          }),
          isAvailable: Joi.boolean().required(),
        })
      )
      .min(7)
      .max(7)
      .unique("day", { ignoreUndefined: true }),
    documents: Joi.array(),
    segment_Id: Joi.number().valid(1, 2, 3),
    image: Joi.string(),
    completeProgess: Joi.number(),
    gallery: Joi.array(),
    rating: Joi.number(),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });
  return schema.validate(store);
}

const createStore = asyncHandler(async (req, res) => {
  // console.log(req.body, ":req.body");
  const { error } = validateStores(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  const storeOwnerFind = await User.findOne({
    _id: req.body.salon_owner_Id,
    role: "store",
    isSuspend: false,
    isDeleted: false,
  });

  const isStoreExist = await Store.findOne({
    salon_owner_Id: req.body.salon_owner_Id,
    isDeleted: false,
    isSuspend: false,
  });

  if (isStoreExist) {
    return res
      .status(400)
      .send({ status: false, message: "This Store Id is already Registered." });
  }

  if (!storeOwnerFind) {
    return res
      .status(404)
      .send({ status: false, message: "Store owner record not exists" });
  }

  const categoryFind = await Categories.find({
    _id: { $in: req.body.category_Ids },
    isSuspend: false,
    isDeleted: false,
  });

  if (!categoryFind) {
    return res
      .status(404)
      .send({ status: false, message: "Category record not exists" });
  }

  if (!storeOwnerFind?.isVerified) {
    return res
      .status(403)
      .send({ status: false, message: "Store owner not verified" });
  }

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/uploads/${image}` : "";

  const store = await new Store(req.body).save();

  if (store) {
    return res.status(201).send({
      status: true,
      message: "Sucessfully created store",
      store: store,
    });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Something Error while creating store" });
  }
});

const updateStore = asyncHandler(async (req, res) => {
  const { error } = validateUpdateStores(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  const isStoreExist = await Store.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStoreExist) {
    return res.status(400).send({ status: false, message: "Store not exist" });
  }

  const documentUrls = [];
  if (req?.files?.documents) {
    req?.files?.documents?.forEach((document) => {
      const documentUrl = `${LIVEPATH}/uploads/${document?.filename}`;
      documentUrls.push(documentUrl);
    });
  }

  req.body.documents =
    documentUrls?.length > 0
      ? [...documentUrls, ...isStoreExist?.documents]
      : isStoreExist?.documents;

  const galleryUrls = [];
  if (req?.files?.gallery) {
    req?.files?.gallery?.forEach((galleryImage) => {
      const galleryImageUrl = `${LIVEPATH}/uploads/${galleryImage?.filename}`;
      galleryUrls.push(galleryImageUrl);
    });
  }

  req.body.gallery =
    galleryUrls?.length > 0
      ? [...galleryUrls, ...isStoreExist?.gallery]
      : isStoreExist?.gallery;

  const imageUrls = [];
  if (req?.files?.image) {
    req?.files?.image.forEach((image) => {
      const imageUrl = `${LIVEPATH}/uploads/${image?.filename}`;
      imageUrls.push(imageUrl);
    });
  }

  req.body.image = imageUrls?.length > 0 ? imageUrls?.[0] : isStoreExist?.image;

  let updatedStore = await Store.findByIdAndUpdate(
    isStoreExist?._id,
    _.pick(req.body, [
      "segment_Id",
      "name",
      "country",
      "city",
      "phone",
      "latitude",
      "longitude",
      "image",
      "documents",
      "gallery",
      "store_timings",
      "completeProgess",
      "details",
      "location",
      "no_of_slots",
      "category_Ids",
    ]),
    { new: true }
  ).populate("category_Ids");
  return res.status(200).send({
    status: true,
    message: "Updated store details successfully",
    store: updatedStore,
  });
});

const changeStoreStatus = asyncHandler(async (req, res) => {
  const isStoreExist = await Store.find({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStoreExist) {
    return res.status(400).send({ status: false, message: "Store Not Exist" });
  }

  if (isStoreExist) {
    await Store.findByIdAndUpdate(req.params.id, {
      $set: { isActive: req?.body?.status },
    });
    return res.status(200).send({
      status: true,
      message: "Sucessfully verified successfully",
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something Error while verifying store",
    });
  }
});

const getOneStore = asyncHandler(async (req, res) => {
  let store;
  if (req.query.type === "owner") {
    store = await Store.findOne({
      salon_owner_Id: req.params.id,
      isDeleted: false,
      isSuspend: false,
    });
  } else if (req.query.type === "store") {
    store = await Store.findOne({
      _id: req.params.id,
      isDeleted: false,
      isSuspend: false,
    });
  } else {
    return res.status(404).send({
      status: false,
      message: "Invalid type",
      storeData: [],
    });
  }

  if (store) {
    const servicesData = await Service.find({
      store_Id: store?._id,
      isDeleted: false,
      isSuspend: false,
    }).populate("service_category_Id");

    const services = {};
    let serviceId = 1;
    servicesData.forEach((service) => {
      const category = service.service_category_Id
        ? service.service_category_Id.name
        : "Uncategorized";

      if (!services[category]) {
        services[category] = [];
      }

      const serviceObject = { ...service.toObject() }; // Convert Mongoose Document to plain object
      // serviceObject.id = serviceId++;
      services[category].push(serviceObject);
    });

    let id = 1;

    for (const category in services) {
      if (services.hasOwnProperty(category)) {
        const items = services[category];
        for (const item of items) {
          item.id = id++;
        }
      }
    }

    const categories = Object.keys(services);

    const staff = await Staffs.find({
      store_Id: store?._id,
      isDeleted: false,
      isSuspend: false,
    });

    const data = { store, services, staff, serviceCategory: categories };

    return res.status(200).send({ status: true, storeData: data });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store record does not exists",
      storeData: [],
    });
  }
});

const getStoreAnalytics = asyncHandler(async (req, res) => {

  const allBookings = await Booking.find({ store_Id: req.params.id });
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

  if (req?.query?.to === "manual") {
    return analyticsData;
  } else {
    return res.status(200).json(analyticsData);
  }
});

const getStoreGraphsData = asyncHandler(async (req, res) => {
  const requestedYear = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  const allCategories = await StoreCategories.find({
    store_Id: req.params.id,
    isDeleted: false,
  });
  const allStaffs = await Staffs.find({ store_Id: req.params.id });
  const allServices = await Service.find({ store_Id: req.params.id });

  const servicesNames = allServices.map((staff) => staff.name);
  const staffsNames = allStaffs.map((staff) => staff.name);
  const categoryNames = allCategories.map((category) => category.name);
  const allBookings = await Booking.find({ store_Id: req.params.id }).populate({
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

  categoryNames.forEach((categoryName) => {
    categoryCounts[categoryName] = 0;
  });

  staffsNames.forEach((staffName) => {
    staffBookingCounts[staffName] = 0;
  });

  servicesNames.forEach((serviceName) => {
    serviceCounts[serviceName] = 0;
  });

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

      // Category Counts
      booking.service_Ids.forEach((service) => {
        const categoryName = service.service_category_Id.name;
        if (categoryCounts.hasOwnProperty(categoryName)) {
          categoryCounts[categoryName]++;
        }
      });

      // Staff Booking Counts
      const staffFind = await Staffs.findById(
        booking?.salon_staff_Id?.toString()
      );
      const staffName = staffFind?.name;
      if (!staffBookingCounts[staffName]) {
        staffBookingCounts[staffName] = 0;
      }
      staffBookingCounts[staffName]++;

      booking.service_Ids.forEach((service) => {
        const serviceName = service.name;
  
        if (serviceCounts.hasOwnProperty(serviceName)) {
          serviceCounts[serviceName]++;
        }
      });
    }
  }
  if (totalBookings > 0) {
    Object.keys(categoryCounts).forEach((categoryName) => {
      const count = categoryCounts[categoryName];
      categoryCountsPercentage[categoryName] = (count / totalBookings) * 100;
    });

    Object.keys(staffBookingCounts).forEach((staffName) => {
      const count = staffBookingCounts[staffName];
      staffBookingPercentage[staffName] = (count / totalBookings) * 100;
    });

    Object.keys(serviceCounts).forEach((serviceName) => {
      const count = serviceCounts[serviceName];
      servicePercentage[serviceName] = (count / totalBookings) * 100;
    });
  } else {
    Object.keys(categoryCounts).forEach((categoryName) => {
      categoryCountsPercentage[categoryName] = 0;
    });

    Object.keys(staffBookingCounts).forEach((staffName) => {
      staffBookingPercentage[staffName] = 0;
    });

    Object.keys(serviceCounts).forEach((serviceName) => {
      servicePercentage[serviceName] = 0;
    });
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

  if (req.query.to === "manual") {
    return analyticsData;
  } else {
    return res.status(200).json(analyticsData);
  }
});

const sendStoreNotification = asyncHandler(async (req, res) => {
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

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/uploads/${image}` : false;
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
  } else if (req.body.target === "Specific-User") {
    users = await User.find({
      _id: { $in: req.body.userIds },
      role: "user",
      isDeleted: false,
    });
  } else if (req.body.target === "Staffs") {
    let usersData = await Staffs.find({
      store_Id: req.params.id,
    });
    let data = usersData?.map((item) => item.salon_staff_Id);
    users = await User.find({
      _id: { $in: data },
      role: "staff",
      isDeleted: false,
    });
  } else if (req.body.target === "Specific-Staff") {
    users = await User.find({
      _id: { $in: req.body.userIds },
      role: "staff",
      isDeleted: false,
    });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Invalid target type" });
  }

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

const getStoreReferral = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    role: "store",
    isDeleted: false,
  });
  if (!user) {
    return res
      .status(200)
      .json({ status: false, message: "Store owner not exists!" });
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

const storeReferralLinkGenerated = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    role: "store",
    isDeleted: false,
  });
  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "Store owner not exists!" });
  }

  // console.log(user);
  if (user?.referralCode) {
    return res.status(200).json({
      status: true,
      message: "ReferralLink already generated",
      store: user,
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
      store: userUpdate,
    });
  } else {
    return res.status(404).json({
      status: false,
      message: "Something error while generating referralLink",
    });
  }
});

const getAllStore = asyncHandler(async (req, res) => {
  const store = await Store.find({
    isDeleted: false,
    isSuspend: false,
  }).populate("category_Ids");
  const user_Id = req.query.user_Id;

  if (!user_Id) {
    return res
      .status(400)
      .send({ status: false, message: "User ID is required" });
  }

  const user = await User.findOne({
    _id: user_Id,
    isDeleted: false,
    role: "user",
  });

  if (!user) {
    return res.status(404).send({ status: false, message: "User not found" });
  }

  const favoriteStoreIds = user.favourite.stores.map((store) =>
    store.toString()
  );

  const storesWithFavouriteFlag = store.map((storeItem) => {
    const isFavourite = favoriteStoreIds.includes(storeItem._id.toString());
    return { ...storeItem.toObject(), isFavourite };
  });

  if (storesWithFavouriteFlag.length > 0) {
    return res
      .status(200)
      .send({ status: true, store: storesWithFavouriteFlag });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store record does not exist",
      store: [],
    });
  }
});

const completeStoreInfo = asyncHandler(async (req, res) => {
  let staffs = [];
  let storeInfo = "";
  let bookings = [];
  let blogs = [];
  let services = [];
  let coupons = [];
  let referrals = [];
  let categories = [];
  let notifications = [];
  let transactions = [];
  let analytics = "";
  let staffPayroll = [];
  let graphs = "";
  let storeMarketing = [];

  const store = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  })
    .populate({ path: "salon_owner_Id", select: "_id" })
    .populate("category_Ids");

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  } else if (store) {
    storeInfo = store;
  }

  const storeAnalytics = await getStoreAnalytics(req, res);
  if (storeAnalytics) {
    analytics = storeAnalytics;
  }

  const storeGraphs = await getStoreGraphsData(req, res);
  if (storeGraphs) {
    graphs = storeGraphs;
  }

  const getAllStaffs = await Staffs.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("salon_staff_Id", "name isDeleted");

  if (getAllStaffs?.length > 0) {
    staffs = getAllStaffs;
  }

  const storebooking = await Booking.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSessionExpired: false,
  })
    .populate("service_Ids")
    .populate({ path: "user_Id", select: "name gender email phone" })
    .populate("store_Id salon_staff_Id");
  if (storebooking?.length > 0) {
    bookings = storebooking;
  }

  const storeBlogs = await Blog.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (storeBlogs?.length > 0) {
    blogs = storeBlogs;
  }

  const StoreService = await Service.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("service_category_Id");
  if (StoreService?.length > 0) {
    services = StoreService;
  }

  const market = await Marketing?.find({
    store_Id: req.params.id,
  });

  if (market?.length > 0) {
    storeMarketing = market;
  }

  const storeCoupon = await StoreCoupon.find({
    store_Id: req.params.id,
    isDeleted: false,
  });
  if (storeCoupon?.length > 0) {
    coupons = storeCoupon;
  }

  const user = await User.findOne({
    _id: store?.salon_owner_Id._id,
    role: "store",
    isDeleted: false,
  });

  const referralFind = await Referral.find({
    from_referral_userId: user?._id,
  }).populate("from_referral_userId to_referral_userId");

  const totalAmountReward = referralFind?.reduce(
    (acc, obj) => (acc += obj.rewarded_amount),
    0
  );
  if (referralFind.length > 0) {
    referrals = referralFind;
  }

  const storeNotifications = await Notification.find({
    userId: store?.salon_owner_Id._id,
  }).sort({ createdAt: -1 });

  if (storeNotifications?.length > 0) {
    notifications = storeNotifications;
  }

  const storeCategories = await StoreCategories.find({
    store_Id: req.params.id,
    isDeleted: false,
  });
  if (storeCategories?.length > 0) {
    categories = storeCategories;
  }

  const storeTransactions = await Payment.find({
    store_Id: req.params.id,
  }).populate({
    path: "user_Id store_Id",
    select: "name",
  });

  if (storeTransactions?.length > 0) {
    transactions = storeTransactions;
  }

  const getStaffPayroll = await StaffPayroll.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate({ path: "staff_Id", select: "name title" });

  if (getStaffPayroll?.length > 0) {
    staffPayroll = getStaffPayroll;
  }

  const storeData = {
    staffs,
    storeInfo,
    bookings,
    blogs,
    services,
    coupons,
    referrals,
    totalAmountReward,
    categories,
    transactions,
    notifications,
    graphs,
    analytics,
    staffPayroll,
    storeMarketing,
  };

  return res.status(200).json(storeData);
});

export {
  completeStoreInfo,
  getStoreReferral,
  storeReferralLinkGenerated,
  createStore,
  getOneStore,
  changeStoreStatus,
  updateStore,
  getStoreAnalytics,
  getStoreGraphsData,
  sendStoreNotification,
  getStoreNotification,
  StoreNotificationSeen,
  getAllStore,
};
