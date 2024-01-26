import asyncHandler from "#middlewares/asyncHandler";
import { Service } from "#models/services_model";
import { Blog } from "#models/blogs_model";
import { StoreCoupon } from "#models/store_coupon_model";
import { Staffs } from "#models/staff_model";
import { Booking } from "#models/booking_model";
import { StoreCategories } from "#models/store_categories_model";
import { Store } from "#models/store_model";
import { User } from "#models/user_model";
import { Categories } from "#models/category_model";

const getAllStore = asyncHandler(async (req, res) => {
  const store = await Store.find({ isDeleted: false }).populate(
    "salon_owner_Id"
  );
  if (store?.length > 0) {
    return res.status(200).send({ status: true, store: store });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store record does not exists",
      store: [],
    });
  }
});

const suspendStore = asyncHandler(async (req, res) => {
  const isExist = await Store.findOne({
    _id: req.params.id,
    ...(req.query.type === "suspended" && { isSuspend: false }),
    ...(req.query.type === "unsuspended" && { isSuspend: true }),
    ...(req.query.type === "deleted" && { isDeleted: false }),
  }).populate("salon_owner_Id");
  console.log(isExist, "isExist");
  if (isExist) {
    await Store.findByIdAndUpdate(
      req.params.id,

      req.query.type === "suspended"
        ? {
            $set: { isSuspend: true },
          }
        : req.query.type === "deleted"
        ? {
            $set: { isDeleted: true },
          }
        : req.query.type === "unsuspended"
        ? {
            $set: { isSuspend: false },
          }
        : ""
      //   {

      //   $set: { isSuspend: true },

      //   $set:
      //     req.query.type === "suspended"
      //       ? { isSuspend: true }
      //       : { isDeleted: true },
      // }
    );
    const store = await Store.find({ isDeleted: false }).populate(
      "salon_owner_Id"
    );
    return res.status(200).send({
      status: true,
      message: `Store ${req.query.type} successfully`,
      store: store,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Store does not exists",
      store: [],
    });
  }
});

const getCompleteAdmin = asyncHandler(async (req, res) => {
  let staffs = [];
  let services = [];
  let bookings = [];
  let allStores = [];
  let serviceCategoies = [];
  let storeCoupons = [];
  let storeCategories = [];
  let users = [];

  const isAdmin = await User.findOne({
    _id: req.params.id,
    role: "admin",
    isDeleted: false,
  });

  if (!isAdmin) {
    return res.status(403).send({
      status: false,
      message: "You are not authorized to perform this action",
    });
  }
  // all users
  const findUsers = await User.find({
    role: "user",
    isDeleted: false,
  }).select("-password");
  if (findUsers?.length > 0) {
    users = findUsers;
  }

  // all stores
  const store = await Store.find({
    isDeleted: false,
  }).populate({ path: "salon_owner_Id", select: "name gender email phone" });

  if (store) {
    allStores = store;
  }
  //  salon staff
  const findStaff = await Staffs.find({
    isDeleted: false,
    isSuspend: false,
  }).populate("salon_staff_Id store_Id");
  if (findStaff?.length > 0) {
    staffs = findStaff;
  }
  // service category
  const findServiceCategory = await StoreCategories.find({
    isDeleted: false,
  }).populate("store_Id");

  if (findServiceCategory?.length > 0) {
    serviceCategoies = findServiceCategory;
  }
  // Store category
  const findStoreCategory = await Categories.find({
    isDeleted: false,
    isSuspend: false,
  });
  if (findStoreCategory?.length > 0) {
    storeCategories = findStoreCategory;
  }
  // Bookings
  const findBooking = await Booking.find({
    isDeleted: false,
    isSessionExpired: false,
  })
    .populate("service_Ids")
    .populate({ path: "user_Id", select: "name gender email phone" })
    .populate("store_Id salon_staff_Id");
  if (findBooking?.length > 0) {
    bookings = findBooking;
  }

  const findService = await Service.find({
    isDeleted: false,
    isSuspend: false,
  }).populate("service_category_Id store_Id");
  if (findService?.length > 0) {
    services = findService;
  }

  const findCoupons = await StoreCoupon.find({
    isDeleted: false,
  }).populate("store_Id");
  if (findCoupons?.length > 0) {
    storeCoupons = findCoupons;
  }

  const complateAdmin = {
    staffs,
    services,
    bookings,
    serviceCategoies,
    storeCoupons,
    allStores,
    storeCategories,
    users,
  };

  return res.status(200).json(complateAdmin);
});

export { getAllStore, getCompleteAdmin, suspendStore };
