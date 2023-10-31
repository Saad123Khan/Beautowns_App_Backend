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

function validateBooking(service) {
    const schema = Joi.object({
        user_Id: Joi.string().required(),
        store_Id: Joi.string().required(),
        service_Ids: Joi.array().items(Joi.string()).min(1).required(),
        time: Joi.string().pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9][ap]m$/i).message('Invalid time format. Please use this format hh:mmam or hh:mmpm').required(),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).message("Invalid date format. Please use this format YYYY-MM-DD").required(),
      
    });

    return schema.validate(service);
}

const createBooking = asyncHandler(async (req, res) => {

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
            .send({ status: false, message: availableBookingSlots?.[0]?.slots});
    }


    const checkedSlotAvailable = availableBookingSlots?.[0]?.slots.some((i) => {
        return i === req.body.time;
    });


    if (!checkedSlotAvailable) {
        return res
            .status(404)
            .send({ status: false, message: "Sorry, this slot is reserved by another customer. Please select a different time slot for your booking" ,availableSlots:availableBookingSlots?.[0]?.slots});
    }

    const startTime = moment("10:00am", "h:mma");
    const time = startTime.clone().add(req.body.duration, 'minutes');
    const endTime = time.format("h:mma");
    const formattedDate = moment(req.body.date, "YYYY-MM-DD").format("D MMMM YYYY");

    let booking = await new Booking({user_Id:req.body.user_Id ,store_Id:req.body.store_Id,service_Ids:req.body.service_Ids,time:req.body.time,date:formattedDate,end:endTime,duration:req.body.duration,amount:totalValue}).save();
    
    if(booking)
    {
        return res
        .status(200)
        .send({ status: true, message: "Booking created successfully" ,booking});

    }
    else{
        return res
        .status(404)
        .send({ status: false, message: "Error while creating booking"});
    }
})


const getAllBooking = asyncHandler(async (req, res) => {
   
    const store = await Store.findOne({ _id: req.params.id, isSuspend: false, isDeleted: false })
    if (!store) {
        return res
            .status(404)
            .send({ status: false, message: "Store does not exists" });
    }
   
    const storebooking = await Booking.find({ store_Id:req.params.id,isDeleted: false});
    if (storebooking?.length > 0) {
      return res.status(200).send({ status: true, booking: storebooking });
    } else {
      return res.status(404).send({
        status: false,
        message: "Booking record does not exists",
        store: [],
      });
    }
  });

export { createBooking,getAllBooking }