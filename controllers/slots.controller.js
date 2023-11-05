


import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import { Store } from "#models/store_model";
import moment from 'moment-timezone';
import { Booking } from "#models/booking_model";

//@desc Get Available Slots for the Next 6 Months
//@route /slots
//@request Get Request
//@access private



const getAvailableSlots = asyncHandler(async (req, res) => {
  const wantedToBookSlot = { duration: req.body.duration || 0 };



  

  const store = await Store.findOne({
    _id: req.body.store_Id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!store) {
    return res.status(404).json({ status: false, message: "Store does not exists" });
  }

let bookedSlotsForDate = await Booking.find({store_Id:req.body.store_Id,isDeleted:false,isCancel:false,isSessionExpired:false}).select("duration time date")
 
// const bookedSlotsForDate = [
//     { duration: 15, time: "10:00am", date: "3 November 2023" },
//     { duration: 15, time: "10:00am", date: "3 November 2023" },
//     { duration: 15, time: "10:30am", date: "3 November 2023" },
//     { duration: 15, time: "10:30am", date: "3 November 2023" },
//   ];



  const availableTimings = store?.store_timings;

  
  const eachSlotsAllowed = store?.no_of_slots;

  

  const currentDate = moment(req.body.date).tz("Asia/Karachi");
  let endDate;
  if (req.body.date) {
    endDate = moment(req.body.date).add(0, 'day');
  }
  else {
    endDate = moment(currentDate).add(3, 'months');
  }

  function createSlots(fromTime, toTime, wantedDuration, date) {
    const startTime = moment(fromTime, "hh:mma").tz("Asia/Karachi");
    const endTime = moment(toTime, "hh:mma").tz("Asia/Karachi");
    if (endTime.isBefore(startTime)) {
      endTime.add(1, "day");
    }

    let arr = [];

    while (startTime <= endTime) {
      const slotTime = new moment(startTime).format("hh:mma");

      let isSlotAvailable = true;

      if (bookedSlotsForDate?.length > 0) {
        bookedSlotsForDate.map((item) => {
          if (date === item.date) {
            isSlotAvailable = !isSlotBooked(slotTime, bookedSlotsForDate, date, eachSlotsAllowed);
          }
        })
      }

      if (isSlotAvailable) {
       
          arr.push(slotTime);
       
        // const slotEndTime = moment(slotTime, "hh:mma").add(wantedDuration, "minutes");
        // if (slotEndTime.isBefore(endTime)) {
        //   arr.push(slotTime);
        // }
      }

      startTime.add(15, "minutes");
    }

    return arr;
  }

  let arr = [];
  let currentDay = new Date(currentDate);

  while (currentDay <= endDate) {
    const day = currentDay.toLocaleDateString("en-US", {
      timeZone: "Asia/Karachi",
      weekday: "long",
    });
    const date = currentDay.getDate();
    const month = currentDay.toLocaleDateString("en-US", {
      timeZone: "Asia/Karachi",
      month: "long",
    });
    const year = currentDay.getFullYear();
    const dayDate = `${date} ${month} ${year}`;
    const dayTimings = availableTimings.find((timing) => timing.day === day);

    if (dayTimings?.isAvailable) {
      const from = dayTimings.from;
      const to = dayTimings.to;

      const resultArray = createSlots(from, to, wantedToBookSlot.duration, dayDate);

      if (resultArray.length > 0) {
        arr.push({ date: { day, date, month, year ,completeDate:dayDate }, slots: resultArray ,isAvailable : dayTimings?.isAvailable});
      } else {
        arr.push({ date: { day, date, month, year ,completeDate:dayDate }, slots: ["Store is fully booked today date"] , isAvailable : dayTimings?.isAvailable });
      }
    }

    else {
      arr.push({ date: { day, date, month, year,completeDate:dayDate }, slots: ["We are closed today"] , isAvailable : dayTimings?.isAvailable });
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  const result = arr.filter((item => {
    let res = item.slots.filter((x) => {
      const timeSlotsValid = createValidSlots(x, item.slots)
      if (timeSlotsValid == x) {
        return x
      }
    })
    
    res = res.length > 0 ? item.isAvailable ? res.slice(0, -1) : ["We are closed today"] : ["Try selecting different services to see more availability"] 
    
    item.slots = res.length > 0 ? res : ["Store is fully booked today date"]
    item.isAvailable = res.length > 0 ? item.isAvailable : false
    
    const currentDate = moment().format('DD MMMM YYYY');
   const currentMoment = moment.tz("Asia/Karachi");
      
      if(!item?.slots?.includes("Store is fully booked today date") && !item?.slots?.includes("We are closed today") && !item?.slots?.includes("Try selecting different services to see more availability") && item?.slots?.length > 0 && item?.isAvailable && item.date?.completeDate === currentDate)
    {
       item.slots = item?.slots?.filter(slot => moment(slot, 'hh:mma').isSameOrAfter(currentMoment));
    }
    return item
  }))

  function createValidSlots(fromTime, availableSlots) {
    const startTime = moment(fromTime, 'hh:mma');
    const endTime = moment(startTime).add(wantedToBookSlot?.duration - 1, 'minutes');
    const slots = [];

    while (startTime.isBefore(endTime) || startTime.isSame(endTime)) {
      slots.push(startTime.format('hh:mma'));
      startTime.add(15, 'minutes');
    }

    const allExist = slots.every(slot => availableSlots.includes(slot));
    if (allExist) {
      return fromTime;
    }
  }
  
  return result
  // return res.status(200).json({ status: true, data: result });
});





//@desc Get Available Slots for the Next 6 Months
//@route /slots
//@request Get Request
//@access private






const getStoreAvailableSlots = asyncHandler(async (req, res) => {
  const wantedToBookSlot = { duration: req.query.duration || 0 };
  
  if(req.query.user_Id)
  {
    await Booking.deleteMany({ user_Id:req.query.user_Id,paymentDone:false,isCheckIn:false, isDeleted :false, isCancel:false})
  }
  

  let bookedSlotsForDate = await Booking.find({store_Id:req.params.id,isDeleted:false,isCancel:false,isSessionExpired:false}).select("duration time date")

  // const bookedSlotsForDate = [
  //   { duration: 15, start: "10:00am", date: "31 October 2023" },
  //   { duration: 15, start: "10:00am", date: "31 October 2023" },

  //   // { duration: 30, start: "9:30pm", date: "30 October 2023" },
    
  //   // { duration: 30, start: "9:30pm", date: "30 October 2023" },
   
  //   // { duration: 30, start: "10:30am", date: "28 October 2023" },
    
  //   // { duration: 30, start: "10:30am", date: "28 October 2023" },
  //   ];



  // const user = await User.findOne({
  //   _id: req.params.id,
  //   role: "user",
  //   isDeleted: false,
  //   isSuspend: false,
  // });

  // if (!user) {
  //   return res.status(404).json({ status: false, message: "User does not exist" });
  // }

  const store = await Store.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!store) {
    return res.status(404).json({ status: false, message: "Store does not exist" });
  }

  const availableTimings = store.store_timings;

  const eachSlotsAllowed = store?.no_of_slots;

  const currentDate = moment.tz("Asia/Karachi");
  let endDate;
  if (req.query.date) {
    endDate = moment(req.query.date).add(1, 'day');
  }
  else {
    endDate = moment(currentDate).add(3, 'months');
  }

  function createSlots(fromTime, toTime, wantedDuration, date) {
    const startTime = moment(fromTime, "hh:mma").tz("Asia/Karachi");
    const endTime = moment(toTime, "hh:mma").tz("Asia/Karachi");
    if (endTime.isBefore(startTime)) {
      endTime.add(1, "day");
    }

    let arr = [];

    while (startTime <= endTime) {
      const slotTime = new moment(startTime).format("hh:mma");

      let isSlotAvailable = true;

      if (bookedSlotsForDate?.length > 0) {
        bookedSlotsForDate.map((item) => {
          if (date === item.date) {
            isSlotAvailable = !isSlotBooked(slotTime, bookedSlotsForDate, date, eachSlotsAllowed);
          }
        })
      }

      if (isSlotAvailable) {
       
          arr.push(slotTime);
       
        // const slotEndTime = moment(slotTime, "hh:mma").add(wantedDuration, "minutes");
        // if (slotEndTime.isBefore(endTime)) {
        //   arr.push(slotTime);
        // }
      }

      startTime.add(15, "minutes");
    }

    return arr;
  }

  let arr = [];
  let currentDay = new Date(currentDate);

  while (currentDay <= endDate) {
    const day = currentDay.toLocaleDateString("en-US", {
      timeZone: "Asia/Karachi",
      weekday: "long",
    });
    const date = currentDay.getDate();
    const month = currentDay.toLocaleDateString("en-US", {
      timeZone: "Asia/Karachi",
      month: "long",
    });
    const year = currentDay.getFullYear();
    const dayDate = `${date} ${month} ${year}`;
    const dayTimings = availableTimings.find((timing) => timing.day === day);

    if (dayTimings?.isAvailable) {
      const from = dayTimings.from;
      const to = dayTimings.to;

      const resultArray = createSlots(from, to, wantedToBookSlot.duration, dayDate);

      if (resultArray.length > 0) {
        arr.push({ date: { day, date, month, year ,completeDate:dayDate }, slots: resultArray ,isAvailable : dayTimings?.isAvailable});
      } else {
        arr.push({ date: { day, date, month, year ,completeDate:dayDate }, slots: ["Store is fully booked today date"] , isAvailable : dayTimings?.isAvailable });
      }
    }

    else {
      arr.push({ date: { day, date, month, year,completeDate:dayDate }, slots: ["We are closed today"] , isAvailable : dayTimings?.isAvailable });
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  const result = arr.filter((item => {
    let res = item.slots.filter((x) => {
      const timeSlotsValid = createValidSlots(x, item.slots)
      if (timeSlotsValid == x) {
        return x
      }
    })
    
    res = res.length > 0 ? item.isAvailable ? res.slice(0, -1) : ["We are closed today"] : ["Try selecting different services to see more availability"] 
    
    item.slots = res.length > 0 ? res : ["Store is fully booked today date"]
    item.isAvailable = res.length > 0 ? item.isAvailable : false
    
    
    const currentDate = moment().format('DD MMMM YYYY');
   const currentMoment = moment.tz("Asia/Karachi");
      
      if(!item?.slots?.includes("Store is fully booked today date") && !item?.slots?.includes("We are closed today") && !item?.slots?.includes("Try selecting different services to see more availability") && item?.slots?.length > 0 && item?.isAvailable && item.date?.completeDate === currentDate)
    {
       item.slots = item?.slots?.filter(slot => moment(slot, 'hh:mma').isSameOrAfter(currentMoment));
    }
    return item
  }))

  function createValidSlots(fromTime, availableSlots) {
    const startTime = moment(fromTime, 'hh:mma');
    const endTime = moment(startTime).add(wantedToBookSlot?.duration - 1, 'minutes');
    const slots = [];

    while (startTime.isBefore(endTime) || startTime.isSame(endTime)) {
      slots.push(startTime.format('hh:mma'));
      startTime.add(15, 'minutes');
    }

    const allExist = slots.every(slot => availableSlots.includes(slot));
    if (allExist) {
      return fromTime;
    }
  }
  
  return res.status(200).json({ status: true, data: result });
});








function isSlotBooked(slotTime, bookedSlots, date, eachSlotsAllowed) {
  const time = moment(slotTime, "hh:mma");
  let bookedCount = 0;
  for (const bookedSlot of bookedSlots) {
    if (date === bookedSlot.date) {
      const bookedTime = moment(bookedSlot.time, "hh:mma");
      const endTime = bookedTime.clone().add(bookedSlot.duration, "minutes");
      if (time.isSameOrAfter(bookedTime) && time.isBefore(endTime)) {
        bookedCount++;
        if (bookedCount >= eachSlotsAllowed) {
          return true;
        }
      }
    }
  }
  return false;
}


export { getStoreAvailableSlots ,getAvailableSlots };

