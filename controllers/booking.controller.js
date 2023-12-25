import asyncHandler from "#middlewares/asyncHandler";
import { Staffs, validateStaff } from "#models/staff_model";
import { Store } from "#models/store_model";
import { User } from "#models/user_model";
import _ from "lodash";
import bcrypt from "bcryptjs";
import { PATH, LIVEPATH } from "#constant/constant";
import Joi from "joi";
import { Service } from "#models/services_model";
import { getAvailableSlots } from "#controllers/slots.controller";
import moment from "moment";
import { Booking } from "#models/booking_model";
import { validateBookingCoupon } from "#controllers/coupon.controller";
import { Coupon } from "#models/coupons_model";
import { firebaseNotification } from "#utils/firebaseNotification";
import { Payment } from "#models/payment_model";
import { generateRandomCode } from "#utils/generateRandomCode";
import { Wallet } from "#models/wallet_model";
import { Referral } from "#models/referral_modal";

function validateBooking(service) {
  const schema = Joi.object({
    user_Id: Joi.when("booking_type", {
      is: Joi.string().valid("manual").not().exist(),
      then: Joi.string().optional(),
      otherwise: Joi.string().required(),
    }),
    name: Joi.when("booking_type", {
      is: Joi.string().valid("manual").not().exist(),
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    phone: Joi.when("booking_type", {
      is: Joi.string().valid("manual").not().exist(),
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    booking_type: Joi.string().valid("manual", "auto").required(),
    store_Id: Joi.string().required(),
    service_Ids: Joi.array().items(Joi.string()).min(1).required(),
    time: Joi.string()
      .pattern(/^(0?[0-9]|1[0-2]):[0-5][0-9][ap]m$/i)
      .message("Invalid time format. Please use this format hh:mmam or hh:mmpm")
      .required(),
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .message("Invalid date format. Please use this format YYYY-MM-DD")
      .required(),
    staff_Id: Joi.string().optional(),
    couponCode: Joi.string(),
    email: Joi.string()
      .optional()
      .email({ tlds: { allow: false } }),
  });

  return schema.validate(service);
}

const createBooking = asyncHandler(async (req, res) => {
  // await Booking.deleteMany({ user_Id:req.body.user_Id,paymentDone:false,isCheckIn:false, isDeleted :false, isCancel:false})
  console.log(req.body, "Book");
  req.body.date = moment(req.body.date).format("YYYY-MM-DD");
  console.log(req.body?.date);

  const { error } = validateBooking(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const currentDate = new Date();
  const bookingDate = new Date(req.body.date);

  // if (bookingDate < currentDate) {
  //     return res
  //         .status(400)
  //         .send({ status: false, message: "The date of booking should be in the future" });
  // }

  let user;
  if (req.body.booking_type === "auto") {
    user = await User.findOne({
      _id: req.body.user_Id,
      role: "user",
      isSuspend: false,
      isDeleted: false,
      isVerified: true,
    });
  } else if (req.body.booking_type === "manual") {
    if (req.body.email !== "") {
      user = await User.findOne({
        email: req.body.email,
        role: "user",
        isSuspend: false,
        isDeleted: false,
      });
    } else {
      user = await User.findOne({
        _id: req.body.user_Id,
        phone: req.body.phone,
        role: "user",
        isSuspend: false,
        isDeleted: false,
      });
    }

    if (!user) {
      let password = generateRandomCode(req.body.name);
      user = await new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password,
      }).save();
    }
  }

  console.log(user, "USERRRRRR");

  if (!user) {
    return res
      .status(404)
      .send({ status: false, message: "User does not exists" });
  }

  const store = await Store.findOne({
    _id: req.body.store_Id,
    isSuspend: false,
    isDeleted: false,
  });
  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store does not exists" });
  }

  const salonTiming = store?.store_timings.find(
    (timing) => timing.day === moment(bookingDate).format("dddd")
  );

  if (!salonTiming?.isAvailable) {
    return res.status(400).send({
      status: false,
      message: `Sorry, the salon is closed on this date : ${moment(
        bookingDate
      ).format("dddd YYYY MMMM")}.`,
    });
  }

  const salonOpenTime = moment(
    req.body.date + " " + salonTiming.from,
    "YYYY-MM-DD hh:mma"
  );
  const salonCloseTime = moment(
    req.body.date + " " + salonTiming.to,
    "YYYY-MM-DD hh:mma"
  );
  const bookingDateTime = moment(
    req.body.date + " " + req.body.time,
    "YYYY-MM-DD hh:mma"
  );

  //   if (bookingDateTime.isBefore(salonOpenTime)) {
  //     return res.status(400).send({
  //       status: false,
  //       message: `Sorry, the salon is closed at ${
  //         req.body.time
  //       } on ${bookingDate}. Salon opens at ${salonTiming.from} and closes at ${
  //         salonTiming.to
  //       } on ${moment(bookingDate).format("dddd")}.`,
  //     });
  //   }

  let services = await Service.find({
    _id: { $in: req.body.service_Ids },
    store_Id: req.body.store_Id,
    isDeleted: false,
  });

  if (services?.length !== req.body.service_Ids?.length) {
    return res.status(404).send({
      status: false,
      message: "The services or store details provided are invalid.",
    });
  }

  let totalDuration = 0;
  let totalValue = 0;

  for (const item of services) {
    totalDuration += item.duration;
    totalValue += item.value;
  }

  req.body.duration = totalDuration;
  const availableBookingSlots = await getAvailableSlots(req, res);

  if (!availableBookingSlots?.length > 0) {
    return res
      .status(404)
      .send({ status: false, message: "Invalid slot time" });
  }

  if (!availableBookingSlots?.[0]?.isAvailable) {
    return res
      .status(404)
      .send({ status: false, message: availableBookingSlots?.[0]?.slots });
  }

  const checkedSlotAvailable = availableBookingSlots?.[0]?.slots.some((i) => {
    return i === req.body.time;
  });

  if (!checkedSlotAvailable) {
    return res.status(404).send({
      status: false,
      message:
        "Sorry, this slot is reserved by another customer. Please select a different time slot for your booking",
      availableSlots: availableBookingSlots?.[0]?.slots,
    });
  }

  const startTime = moment(req.body.time, "h:mma");
  const time = startTime.clone().add(req.body.duration, "minutes");
  const endTime = time.format("h:mma");
  const formattedDate = moment(req.body.date, "YYYY-MM-DD").format(
    "D MMMM YYYY"
  );

  if (req.body.couponCode) {
    const coupon = await validateBookingCoupon(req, res);
    if (coupon) {
      let discountAmount = coupon?.type?.fixedAmount
        ? parseFloat(coupon?.type?.fixedAmount)
        : (totalValue * parseFloat(coupon?.type?.percentage)) / 100;
      await Coupon.findOneAndUpdate(
        { _id: coupon?._id },
        { $inc: { quantity: -1, totalAmount: discountAmount } }
      );
      totalValue = totalValue - discountAmount;

      let booking;
      if (req.body.booking_type === "manual") {
        booking = await new Booking({
          coupons_Id: coupon?._id,
          user_Id: user?._id,
          store_Id: req.body.store_Id,
          service_Ids: req.body.service_Ids,
          time: req.body.time,
          date: formattedDate,
          end: endTime,
          duration: req.body.duration,
          amount: totalValue,
          booking_type: req.body.booking_type,
          paymentDone: true,
        });
      } else {
        booking = await new Booking({
          coupons_Id: coupon?._id,
          user_Id: user?._id,
          store_Id: req.body.store_Id,
          service_Ids: req.body.service_Ids,
          time: req.body.time,
          date: formattedDate,
          end: endTime,
          duration: req.body.duration,
          amount: totalValue,
          booking_type: req.body.booking_type,
        });
      }

      if (req.body.staff_Id) {
        booking.salon_staff_Id = req.body.staff_Id;
      }

      await booking.save();
 
      
 
await Booking.populate(booking,"store_Id user_Id salon_staff_Id")
      console.log(booking,"bookingbookingbooking")
 
      if (booking) {
      
        if(req.body.booking_type === "manual")
        {
        

        const userNotification = {
          title: "Appointment Booked Successfully",
          body: `You've successfully Booked your appointment at ${booking?.store_Id?.name}. Our team is ready to make your experience exceptional. Enjoy your time with us!`,
        };

        await firebaseNotification(
          userNotification,
          [booking?.user_Id],
          "news",
          "Specific-User",
          "system",
          "users"
        );

        const staffNotification = {
          title: "Appointment Booked Successfully",
          body: `${booking?.user_Id?.name} have booked appointment with you at ${booking?.time} on ${formattedDate}. Be Ready surve your best service!`,
        };

        if (booking?.salon_staff_Id) {
          const staffSalonFind = await User.findById(
            booking?.salon_staff_Id?.salon_staff_Id
          );

          await firebaseNotification(
            staffNotification,
            [staffSalonFind],
            "news",
            "Specific-Staff",
            "system",
            "staffs"
          );
        }

        const salonNotification = {
          title: "Appointment Booked Successfully",
          body: `${booking?.user_Id?.name} have booked appointment with you at Your salon on ${booking?.time} ${formattedDate}. Be Ready surve your best service!`,
        };
  
       const ownerSalonFind =  await User.findById(booking?.store_Id?.salon_owner_Id)
      
       
       console.log(ownerSalonFind,"OWENEEEEE")
       if(ownerSalonFind)
       {
        await firebaseNotification(
          salonNotification,
          [ownerSalonFind],
          "news",
          "Specific-Salon",
          "system",
          "store"
        );
      
       }
      }        
    
        return res.status(201).send({
          status: true,
          message: "Booking created successfully",
          booking,
        });
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Error while creating booking" });
      }
    } else {
      return res
        .status(404)
        .send({ status: false, message: "Invalid coupon code" });
    }
  } else {
    let booking;
    if (req.body.booking_type === "manual") {
      booking = await new Booking({
        user_Id: user?._id,
        store_Id: req.body.store_Id,
        service_Ids: req.body.service_Ids,
        time: req.body.time,
        date: formattedDate,
        end: endTime,
        duration: req.body.duration,
        amount: totalValue,
        booking_type: req.body.booking_type,
        paymentDone: true,
      });
    } else {
      booking = await new Booking({
        user_Id: user?._id,
        store_Id: req.body.store_Id,
        service_Ids: req.body.service_Ids,
        time: req.body.time,
        date: formattedDate,
        end: endTime,
        duration: req.body.duration,
        amount: totalValue,
        booking_type: req.body.booking_type,
      });
    }

    if (req.body.staff_Id) {
      booking.salon_staff_Id = req.body.staff_Id;
    }

    await booking.save();

await Booking.populate(booking,"store_Id user_Id salon_staff_Id")
if (booking) {

if(req.body.booking_type === "manual")
{
  const userNotification = {
    title: "Appointment Booked Successfully",
    body: `You've successfully Booked your appointment at ${booking?.store_Id?.name}. Our team is ready to make your experience exceptional. Enjoy your time with us!`,
  };

  await firebaseNotification(
    userNotification,
    [booking?.user_Id],
    "news",
    "Specific-User",
    "system",
    "users"
  );

  const staffNotification = {
    title: "Appointment Booked Successfully",
    body: `${booking?.user_Id?.name} have booked appointment with you at ${booking?.time} on ${formattedDate}. Be Ready surve your best service!`,
  };


  if(booking?.salon_staff_Id)
  {
    const staffSalonFind =  await User.findById(booking?.salon_staff_Id?.salon_staff_Id)
  
    await firebaseNotification(
      staffNotification,
      [staffSalonFind],
      "news",
      "Specific-Staff",
      "system",
      "staffs"
    );

  }

   
    const salonNotification = {
      title: "Appointment Booked Successfully",
      body: `${booking?.user_Id?.name} have booked appointment with you at Your salon on ${booking?.time} ${formattedDate}. Be Ready surve your best service!`,
    };

   const ownerSalonFind =  await User.findById(booking?.store_Id?.salon_owner_Id)
  
   
   console.log(ownerSalonFind,"OWENEEEEE")
   if(ownerSalonFind)
   {
    await firebaseNotification(
      salonNotification,
      [ownerSalonFind],
      "news",
      "Specific-Salon",
      "system",
      "store"
    );
  
   }
    

}
  
  
      return res.status(201).send({
        status: true,
        message: "Booking created successfully",
        booking,
      });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Error while creating booking" });
    }
  }}
);

const getAllStoreBooking = asyncHandler(async (req, res) => {
  const store = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store does not exists" });
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
    return res.status(200).send({ status: true, booking: storebooking });
  } else {
    return res.status(404).send({
      status: false,
      message: "Booking record does not exists",
      booking: [],
    });
  }
});

const getStaffBooking = asyncHandler(async (req, res) => {
  const idStaffExist = await Staffs.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });
  if (!idStaffExist) {
    return res
      .status(404)
      .send({ status: false, message: "Staff does not exists" });
  }
  const staffbooking = await Booking.find({
    salon_staff_Id: req.params.id,
    isDeleted: false,
    isSessionExpired: false,
  })
    .populate("service_Ids salon_staff_Id store_Id")
    .populate({ path: "user_Id", select: "name gender phone" });

  if (staffbooking?.length > 0) {
    return res.status(200).send({ status: true, booking: staffbooking });
  } else {
    return res.status(404).send({
      status: false,
      message: "Booking record does not exists",
      booking: [],
    });
  }
});

//@desc  ooking Coupon Added
//@route  /booking/coupon-added/:id
//@request POST Request
//@acess  private

const couponCodeBookingAdded = asyncHandler(async (req, res) => {
  if (req.body.couponCode === "") {
    return res
      .status(400)
      .send({ status: false, message: "Coupon Code field is not empty" });
  }
  console.log(req.body);
  const booking = await Booking.findOne({
    _id: req.body.booking_Id,
    user_Id: req.body.user_Id,
    isCheckIn: false,
    isCancel: false,
    isDeleted: false,
    isSessionExpired: false,
    paymentDone: false,
  });
  if (!booking) {
    return res
      .status(404)
      .send({ status: false, message: "Booking does not exists" });
  }
  if (booking?.coupons_Id) {
    return res
      .status(400)
      .send({ status: false, message: "Coupon already applied" });
  }

  const coupon = await validateBookingCoupon(req, res);
  if (coupon) {
    let discountAmount = coupon?.type?.fixedAmount
      ? parseFloat(coupon?.type?.fixedAmount)
      : (booking?.amount * parseFloat(coupon?.type?.percentage)) / 100;
    await Coupon.findOneAndUpdate(
      { _id: coupon?._id },
      { $inc: { quantity: -1, totalAmount: discountAmount } }
    );
    let totalValue = booking?.amount - discountAmount;

    let bookingUpdate = await Booking.findByIdAndUpdate(
      booking?._id,
      { coupons_Id: coupon?._id, amount: totalValue, discount: discountAmount },
      { new: true }
    );

    if (bookingUpdate) {
      return res.status(200).send({
        status: true,
        message: "Coupon added successfully",
        booking: bookingUpdate,
      });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Error while adding coupon" });
    }
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Invalid coupon code" });
  }
});

//@desc  User Booking Get
//@route  /booking/:id
//@request Get Request
//@acess  private

const getUserBooking = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });
  if (!user) {
    return res
      .status(404)
      .send({ status: false, message: "User does not exists" });
  }
  const booking = await Booking.find({
    user_Id: req.params.id,
    isDeleted: false,
    isSessionExpired: false,
  }).populate("service_Ids store_Id");

  if (booking?.length > 0) {
    return res.status(200).send({ status: true, booking: booking });
  } else {
    return res.status(404).send({
      status: false,
      message: "Booking record does not exists",
      booking: [],
    });
  }
});

//@desc  User Booking Cancelled
//@route  /booking/:id
//@request POST Request
//@acess  private

const cancelledBooking = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.body.user_Id,
    role: "user",
    isSuspend: false,
    isDeleted: false,
    isVerified: true,
  });

  if (!user) {
    return res
      .status(404)
      .send({ status: false, message: "User does not exists" });
  }

  const booking = await Booking.findOne({
    _id: req.body.booking_Id,
    paymentDone: true,
    isCheckIn: false,
    isDeleted: false,
  }).populate("store_Id");
  if (booking) {
    if (booking?.isSessionExpired) {
      return res
        .status(400)
        .send({ status: false, message: "Booking expired" });
    }
    if (booking?.isCancel) {
      return res
        .status(400)
        .send({ status: false, message: "Booking cancelled already" });
    }
    const book = await Booking.findOneAndUpdate(
      { _id: booking?._id },
      { isCancel: true },
      { new: true }
    );
    if (book) {
      const notification = {
        title: "Appointment Canceled",
        body: `You've successfully canceled your appointment at ${booking?.store_Id?.name}. If you have any questions or need to reschedule, please don't hesitate to contact us. We look forward to serving you in the future!`,
      };

      await firebaseNotification(
        notification,
        [user],
        "news",
        "Specific-User",
        "system",
        "users"
      );
      return res.status(200).send({
        status: true,
        message: "Booking cancelled sucessfully",
        booking: book,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Something error while cancelling the booking",
      });
    }
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Booking does not exists" });
  }
});

//@desc  User Booking Session Deleted
//@route  /booking/deleted/:id
//@request DELETE Request
//@acess  private

const deleteBooking = asyncHandler(async (req, res) => {
  await Booking.deleteMany({
    user_Id: req.params.id,
    paymentDone: false,
    isCheckIn: false,
    isSessionExpired: false,
    isDeleted: false,
    isCancel: false,
    isDeleted: false,
  });
  return res
    .status(200)
    .send({ status: true, message: "Booking deleted successfully" });
});

//@desc Booking Confirm
//@route  /book/confirmed
//@request POST Request
//@acess  private

const bookingConfirm = asyncHandler(async (req, res) => {
  console.log(req.body);
 

  let user = await User.findOne({
      _id: req.body.user_Id,
      role: "user",
      isSuspend: false,
      isDeleted: false,
      isVerified: true,
    });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "User does not exists" });
    }

    let bookingFind = await Booking.findOne({
      _id: req.body.booking_Id,
      user_Id: req.body.user_Id,
      isCheckIn: false,
      isCancel: false,
      isDeleted: false,
    }).populate("store_Id user_Id salon_staff_Id");
  

  if (!bookingFind) {
    return res
      .status(404)
      .json({ status: false, message: "Booking record not found!" });
  }

  if (bookingFind?.isSessionExpired) {
    return res
      .status(409)
      .json({ status: false, message: "Booking session expired" });
  }

  if (bookingFind?.paymentDone) {
    return res
      .status(200)
      .json({ status: false, message: "Booking already Confirmed" });
  }

  // const paymentFind = await Payment.findOne({
  //   payment_Id: req.body.payment_Id,
  // });

  // if (!paymentFind) {
  //   return res
  //     .status(404)
  //     .json({ status: false, message: "Payment record not found!" });
  // }

  // if (paymentFind?.booking_Id === bookingFind?._id) {

  if (user) {
    const referralFind = await Referral.findOne({
      to_referral_userId: user?._id,
    });

    console.log(user, "useruseruser");

    console.log(referralFind, "referralFindreferralFindreferralFind");

    if (referralFind?.status !== "customer") {
      console.log(user);

      console.log(referralFind);
      let reward = 100;
      const refer = await Referral.findOneAndUpdate(
        { to_referral_userId: user?._id },
        {
          status: "customer",
          referral_level: 2,
          rewarded_amount: reward,
        },
        { new: true }
      );

      // Update refer Wallet
      await Wallet.findOneAndUpdate(
        { userId: refer?.from_referral_userId },
        {
          $inc: { balance: reward },
        }
      );
    }
  }

  const bookingData = await Booking.findOneAndUpdate(
    { _id: req.body.booking_Id },

    {
      // payment_Id: req.body.payment_Id,
      paymentDone: true,
    },
    { new: true }
  );

let booking = await Booking.populate(bookingData,"store_Id user_Id salon_staff_Id")
  
  // const notification = {
  //   title: "Booking Confirmed",
  //   body: `Your appointment at ${bookingFind?.store_Id?.name} on ${booking?.date} has been successfully booked. We look forward to serving you!`,
  // };

  // if (user?.email) {
  //   await firebaseNotification(
  //     notification,
  //     [user],
  //     "news",
  //     "Specific-User",
  //     "system",
  //     "users"
  //   );
  // }



  const userNotification = {
    title: "Appointment Booked Successfully",
    body: `You've successfully Booked your appointment at ${booking?.store_Id?.name}. Our team is ready to make your experience exceptional. Enjoy your time with us!`,
  };

  await firebaseNotification(
    userNotification,
    [booking?.user_Id],
    "news",
    "Specific-User",
    "system",
    "users"
  );

  const staffNotification = {
    title: "Appointment Booked Successfully",
    body: `${booking?.user_Id?.name} have booked appointment with you at ${booking?.time} on ${booking?.date}. Be Ready surve your best service!`,
  };

if(booking?.salon_staff_Id)
{
  const staffSalonFind =  await User.findById(booking?.salon_staff_Id?.salon_staff_Id)

  await firebaseNotification(
    staffNotification,
    [staffSalonFind],
    "news",
    "Specific-Staff",
    "system",
    "staffs"
  );

}

 
  const salonNotification = {
    title: "Appointment Booked Successfully",
    body: `${booking?.user_Id?.name} have booked appointment with you at Your salon on ${booking?.time} ${booking?.date}. Be Ready surve your best service!`,
  };

 const ownerSalonFind =  await User.findById(booking?.store_Id?.salon_owner_Id)

 
 console.log(ownerSalonFind,"OWENEEEEE")
 if(ownerSalonFind)
 {
  await firebaseNotification(
    salonNotification,
    [ownerSalonFind],
    "news",
    "Specific-Salon",
    "system",
    "store"
  );

 }
        

  return res
    .status(200)
    .json({ status: true, message: "Booking is confirmed!", booking });

  // }
  // else {
  //     return res
  //         .status(404)
  //         .json({
  //             status: false,
  //             message: "Please kindly proceed the payment for this booking!",
  //         });
  // }
});

//@desc Booking Confirm
//@route  /book/checkIn
//@request POST Request
//@acess  private

const bookingCheckIn = asyncHandler(async (req, res) => {
  let bookingFind;
  if (req.body.staff_Id) {
    bookingFind = await Booking.findOne({
      _id: req.body.booking_Id,
      store_Id: req.body.store_Id,
      salon_staff_Id: req.body.staff_Id,
      isCancel: false,
      isDeleted: false,
    }).populate("store_Id user_Id");
  } else if (req.body.salon_owner_Id) {
    bookingFind = await Booking.findOne({
      _id: req.body.booking_Id,
      store_Id: req.body.store_Id,
      isCancel: false,
      isDeleted: false,
    }).populate("store_Id user_Id");

    if (
      req.body.salon_owner_Id !==
      bookingFind?.store_Id?.salon_owner_Id?.toString()
    ) {
      return res
        .status(404)
        .json({ status: false, message: "Booking record not found!" });
    }
  }

  if (!bookingFind) {
    return res
      .status(404)
      .json({ status: false, message: "Booking record not found!" });
  }

  if (bookingFind?.isCheckIn) {
    return res
      .status(200)
      .json({ status: false, message: "Booking already CheckIn" });
  }

  if (bookingFind?.booking_type === "auto") {
    if (!bookingFind?.payment_Id) {
      return res.status(404).json({
        status: false,
        message: "Please kindly proceed the payment for this booking!",
      });
    }

    const paymentFind = await Payment.findOne({
      _id: bookingFind?.payment_Id,
    });

    if (!paymentFind) {
      return res
        .status(404)

        .json({ status: false, message: "Booking Payment record not found!" });
    }
  }

  const booking = await Booking.findOneAndUpdate(
    { _id: req.body.booking_Id },

    {
      isCheckIn: true,
    },
    { new: true }
  );

  const notification = {
    title: "Appointment Checked In",
    body: `You've successfully checked in for your appointment at ${bookingFind?.store_Id?.name}. Our team is ready to make your experience exceptional. Enjoy your time with us!`,
  };

  await firebaseNotification(
    notification,
    [bookingFind?.user_Id],
    "news",
    "Specific-User",
    "system",
    "users"
  );

  return res
    .status(200)
    .json({ status: true, message: "Booking is check-in", booking });
});

const bookingsByCoupon = asyncHandler(async (req, res) => {
  const store = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store does not exists" });
  }

  const couponBookings = await Booking.find({
    store_Id: req.params.id,
    coupons_Id: { $exists: true },
    isDeleted: false,
    isSessionExpired: false,
  })
    .populate("service_Ids salon_staff_Id store_Id")
    .populate({ path: "user_Id", select: "name gender phone" });

  if (couponBookings?.length > 0) {
    return res.status(200).send({ status: true, booking: couponBookings });
  } else {
    return res.status(404).send({
      status: false,
      message: "Booking record does not exists",
      booking: [],
    });
  }
});

export {
  bookingConfirm,
  bookingCheckIn,
  createBooking,
  getAllStoreBooking,
  getUserBooking,
  cancelledBooking,
  couponCodeBookingAdded,
  deleteBooking,
  getStaffBooking,
  bookingsByCoupon,
};
