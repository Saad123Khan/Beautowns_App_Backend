import asyncHandler from "#middlewares/asyncHandler";
import { Staffs, validateStaff } from "#models/staff_model";
import { Store } from "#models/store_model";
import { User } from "#models/user_model";
import _ from "lodash";
import bcrypt from "bcryptjs";
import { PATH } from "#constant/constant";
import Joi from "joi";
import { Service } from "#models/services_model";
import { getAvailableSlots } from "#controllers/slots.controller";
import moment from "moment";
import { Booking } from "#models/booking_model";
import { validateBookingCoupon } from "#controllers/coupon.controller";
import { Coupon } from "#models/coupons_model";

function validateBooking(service) {
    const schema = Joi.object({
        user_Id: Joi.string().required(),
        store_Id: Joi.string().required(),
        service_Ids: Joi.array().items(Joi.string()).min(1).required(),
        time: Joi.string().pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9][ap]m$/i).message('Invalid time format. Please use this format hh:mmam or hh:mmpm').required(),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).message("Invalid date format. Please use this format YYYY-MM-DD").required(),
        couponCode: Joi.string()
    });

    return schema.validate(service);
}

const createBooking = asyncHandler(async (req, res) => {

    // await Booking.deleteMany({ user_Id:req.body.user_Id,paymentDone:false,isCheckIn:false, isDeleted :false, isCancel:false})
  
console.log(req.body)
req.body.date = moment(req.body.date, 'D MMMM YYYY').format('YYYY-MM-DD');
console.log(req.body?.date)

    const { error } = validateBooking(req.body);
    if (error) {
        return res
            .status(400)
            .send({ status: false, message: error?.details[0]?.message });
    }




    const currentDate = moment.tz("Asia/Karachi").startOf('day');
    const bookingDate = moment(req.body.date).tz("Asia/Karachi").startOf('day');

    if (currentDate.isAfter(bookingDate)) {
        return res
            .status(400)
            .send({ status: false, message: "The date of booking should be in the future" });
    }

    const user = await User.findOne({ _id: req.body.user_Id, role: "user", isSuspend: false, isDeleted: false, isVerified: true })

    if (!user) {
        return res
            .status(404)
            .send({ status: false, message: "User does not exists" });
    }

    const store = await Store.findOne({ _id: req.body.store_Id, isSuspend: false, isDeleted: false })
    if (!store) {
        return res
            .status(404)
            .send({ status: false, message: "Store does not exists" });
    }


    const salonTiming = store?.store_timings.find((timing) => timing.day === moment(bookingDate).format('dddd'));

    if (!salonTiming?.isAvailable) {
        return res.status(400).send({
            status: false,
            message: `Sorry, the salon is closed on this date : ${moment(bookingDate).format('dddd YYYY MMMM')}.`
        });
    }

    const salonOpenTime = moment(req.body.date + " " + salonTiming.from, "YYYY-MM-DD hh:mma");
    const salonCloseTime = moment(req.body.date + " " + salonTiming.to, "YYYY-MM-DD hh:mma");
    const bookingDateTime = moment(req.body.date + " " + req.body.time, "YYYY-MM-DD hh:mma");

    if (bookingDateTime.isBefore(salonOpenTime) || bookingDateTime.isSameOrAfter(salonCloseTime)) {
        return res.status(400).send({
            status: false,
            message: `Sorry, the salon is closed at ${req.body.time} on ${bookingDate}. Salon opens at ${salonTiming.from} and closes at ${salonTiming.to} on ${moment(bookingDate).format('dddd')}.`
        });
    }

    let services = await Service.find({
        _id: { $in: req.body.service_Ids }, store_Id: req.body.store_Id,
        isDeleted: false
    });

    if (services?.length !== req.body.service_Ids?.length) {
        return res
            .status(404)
            .send({ status: false, message: "The services or store details provided are invalid." });
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
        return res
            .status(404)
            .send({ status: false, message: "Sorry, this slot is reserved by another customer. Please select a different time slot for your booking", availableSlots: availableBookingSlots?.[0]?.slots });
    }

    const startTime = moment("10:00am", "h:mma");
    const time = startTime.clone().add(req.body.duration, 'minutes');
    const endTime = time.format("h:mma");
    const formattedDate = moment(req.body.date, "YYYY-MM-DD").format("D MMMM YYYY");

    if (req.body.couponCode) {
        const coupon = await validateBookingCoupon(req, res)
        if (coupon) {
            let discountAmount = coupon?.type?.fixedAmount ? parseFloat(coupon?.type?.fixedAmount) : totalValue * parseFloat(coupon?.type?.percentage) / 100;
            await Coupon.findOneAndUpdate({ _id: coupon?._id }, { $inc: { quantity: -1, totalAmount: discountAmount } })
            totalValue = totalValue - discountAmount;

            let booking = await new Booking({ coupons_Id: coupon?._id, user_Id: req.body.user_Id, store_Id: req.body.store_Id, service_Ids: req.body.service_Ids, time: req.body.time, date: formattedDate, end: endTime, duration: req.body.duration, amount: totalValue }).save();

            if (booking) {
                return res
                    .status(200)
                    .send({ status: true, message: "Booking created successfully", booking });

            }
            else {
                return res
                    .status(400)
                    .send({ status: false, message: "Error while creating booking" });
            }

        }
        else {
            return res
                .status(404)
                .send({ status: false, message: "Invalid coupon code" });
        }


    }
    else {
        let booking = await new Booking({ user_Id: req.body.user_Id, store_Id: req.body.store_Id, service_Ids: req.body.service_Ids, time: req.body.time, date: formattedDate, end: endTime, duration: req.body.duration, amount: totalValue }).save();

        if (booking) {
            return res
                .status(200)
                .send({ status: true, message: "Booking created successfully", booking });

        }
        else {
            return res
                .status(400)
                .send({ status: false, message: "Error while creating booking" });
        }
    }

})


const getAllStoreBooking = asyncHandler(async (req, res) => {

    const store = await Store.findOne({ _id: req.params.id, isSuspend: false, isDeleted: false })
    if (!store) {
        return res
            .status(404)
            .send({ status: false, message: "Store does not exists" });
    }

    const storebooking = await Booking.find({ store_Id: req.params.id, isDeleted: false, isSessionExpired: false });
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



//@desc  ooking Coupon Added 
//@route  /booking/coupon-added/:id
//@request POST Request
//@acess  private

const couponCodeBookingAdded = asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ _id: req.body.booking_Id,user_Id:req.body.user_Id,isCheckIn:false, isCancel: false, isDeleted: false, isSessionExpired: false, paymentDone: false })
    if (!booking) {
        return res
            .status(404)
            .send({ status: false, message: "Booking does not exists" });
    }
    if (booking?.coupons_Id) {
        return res
            .status(400)
            .send({ status: false, message: "At a time, only one coupon can be added." });
    }

    const coupon = await validateBookingCoupon(req, res)
    if (coupon) {
        let discountAmount = coupon?.type?.fixedAmount ? parseFloat(coupon?.type?.fixedAmount) : booking?.amount * parseFloat(coupon?.type?.percentage) / 100;
        await Coupon.findOneAndUpdate({ _id: coupon?._id }, { $inc: { quantity: -1, totalAmount: discountAmount } })
        let totalValue = booking?.amount - discountAmount;

        let bookingUpdate = await Booking.findByIdAndUpdate(booking?._id, { coupons_Id: coupon?._id, amount: totalValue },{new : true});

        if (bookingUpdate) {
            return res
                .status(200)
                .send({ status: true, message: "Coupon added successfully", booking:bookingUpdate });
        }
        else {
            return res
                .status(400)
                .send({ status: false, message: "Error while adding coupon" });
        }

    }
    else {
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
    const user = await User.findOne({ _id: req.params.id, isSuspend: false, isDeleted: false })
    if (!user) {
        return res
            .status(404)
            .send({ status: false, message: "User does not exists" });
    }
    const booking = await Booking.find({ user_Id: req.params.id, isDeleted: false, isSessionExpired: false });
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
    const booking = await Booking.findById(req.params.id)
    if (booking) {
        if (booking?.isSessionExpired) {
            return res.status(400).send({ status: false, message: "Booking expired" })
        }
        if (booking?.isCancel) {
            return res.status(400).send({ status: false, message: "Booking cancelled already" })
        }
        const book = await Booking.findOneAndUpdate({ _id: booking?._id }, { isCancel: true }, { new: true })
        if (book) {
            return res.status(200).send({ status: true, message: "Booking cancelled sucessfully", booking: book })
        }
        else {
            return res.status(400).send({ status: false, message: "Something error while cancelling the booking" })
        }
    }
    else {
        return res.status(404).send({ status: false, message: "Booking does not exists" })
    }
})


//@desc  User Booking Session Deleted
//@route  /booking/deleted/:id
//@request DELETE Request
//@acess  private


const deleteBooking = asyncHandler(async (req, res) => {
     await Booking.deleteMany({ user_Id:req.params.id,paymentDone:false,isCheckIn:false,isSessionExpired : false , isDeleted :false, isCancel:false,isDeleted:false})
    return res.status(200).send({ status: true, message: "Booking deleted successfully" })
})

//@desc Booking Confirm
//@route  /book/confirm/:id
//@request PUT Request
//@acess  private

export const bookingConfirm = async (req, res, next) => {
    try {
        const bookingFind = await Booking.findOne({ _id: req.params.id, isCheckIn: false, isCancel: false, isDeleted: false });

        if (!bookingFind) {
            return res
                .status(404)
                .json({ status: false, message: "Booking record not found!" });
        }

        if (bookingFind?.isSessionExpired) {
            return res
                .status(404)
                .json({ status: false, message: "Booking session expired" });
        }



        const paymentFind = await Payment.findOne({
            payment_Id: req.body.payment_Id,
        });

        if (!paymentFind) {
            return res
                .status(404)
                .json({ status: false, message: "Payment record not found!" });
        }

        if (paymentFind?.booking_Id === bookingFind?._id) {
            const booking = await Book.findOneAndUpdate(
                { booking_Id: req.params.id },

                {
                    payment_Id: req.body.payment_Id,
                    paymentDone: true,
                },
                { new: true }
            );

            return res.status(200).json({ status: true, message: "Booking is confirmed!", booking });
        } else {
            return res
                .status(404)
                .json({
                    status: false,
                    message: "Please kindly proceed the payment for this booking!",
                });
        }
    } catch (err) {
        next(err);
    }
};

export { createBooking, getAllStoreBooking, getUserBooking, cancelledBooking, couponCodeBookingAdded ,deleteBooking}