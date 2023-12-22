import asyncHandler from "#middlewares/asyncHandler";
import { Service } from "#models/services_model";
import { Blog } from "#models/blogs_model";
import { StoreCoupon } from "#models/store_coupon_model";
import { Staffs } from "#models/staff_model";
import { Booking } from "#models/booking_model";
import { StoreCategories } from "#models/store_categories_model";
import { Store, validateStores } from "#models/store_model";

const getAllStore = asyncHandler(async (req, res) => {
  const store = await Store.find({ isDeleted: false, isSuspend: false });
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

const getSingleStore = asyncHandler(async (req, res) => {
  let staffs = [];
  let services = [];
  let bookings = [];
  let categories = [];
  let coupons = [];
  let storeDetails = [];

  const store = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  }).populate({ path: "salon_owner_Id", select: "name gender email phone" });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  } else {
    storeDetails = store;
  }

  const findStaff = await Staffs.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("salon_staff_Id");
  if (findStaff?.length > 0) {
    staffs = findStaff;
  }
  const findCategory = await Staffs.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("salon_staff_Id");
  if (findCategory?.length > 0) {
    categories = findCategory;
  }

  const findBooking = await Booking.find({
    store_Id: req.params.id,
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
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("service_category_Id");
  if (findService?.length > 0) {
    services = findService;
  }

  const findCoupons = await StoreCoupon.find({
    store_Id: req.params.id,
    isDeleted: false,
  });
  if (findCoupons?.length > 0) {
    coupons = findCoupons;
  }

  const completeStore = {
    staffs,
    services,
    bookings,
    categories,
    coupons,
    storeDetails,
  };

  return res.status(200).json(completeStore);
});

export { getAllStore, getSingleStore };
