import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import { Store } from "#models/store_model";
import moment from 'moment-timezone';

//@desc Get Available Slots for the Next 6 Months
//@route /slots
//@request Get Request
//@access private


const getStoreAvailableSlots = asyncHandler(async (req, res) => {
  const wantedToBookSlot = { duration: 300, date: "27 October 2023" };
  const eachSlotsAllowed = 2;

  const user = await User.findOne({
    _id: req.params.id,
    role: "user",
    isDeleted: false,
    isSuspend: false,
  });

  if (!user) {
    return res.status(404).json({ status: false, message: "User does not exist" });
  }

  const store = await Store.findOne({
    _id: req.query.store_id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!store) {
    return res.status(404).json({ status: false, message: "Store does not exist" });
  }

  const availableTimings = store.store_timings;
  const currentDate = moment.tz("Asia/Karachi");

  const endDate = new Date(currentDate);
  endDate.setMonth(endDate.getMonth() + 3);

  const bookedSlotsForDate = [
    { duration: 120, start: "02:00pm", date: "27 October 2023" },
    { duration: 120, start: "02:00pm", date: "27 October 2023" },
   ];

  function createSlots(fromTime, toTime, wantedDuration, date) {
    const startTime = moment(fromTime, "hh:mma").tz("Asia/Karachi");
    const endTime = moment(toTime, "hh:mma").tz("Asia/Karachi");
    if (endTime.isBefore(startTime)) {
      endTime.add(1, "day");
    }
    let arr = [];

    while (startTime <= endTime) {
      const slotTime = new moment(startTime).format("hh:mma");

      // Check if the slot is booked for the specific date
      let isSlotAvailable = true;
      
      
      if (bookedSlotsForDate?.length > 0) {
        bookedSlotsForDate.map((item)=>{
         if(date === item.date)
         {
          isSlotAvailable = !isSlotBooked(slotTime, bookedSlotsForDate, date, eachSlotsAllowed);
         } 
        })
      }

      if (isSlotAvailable) { 
        const slotEndTime = moment(slotTime, "hh:mma").add(wantedDuration, "minutes");
        if (slotEndTime.isBefore(endTime) || slotEndTime.isSame(endTime)) {
          arr.push(slotTime);
        }
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

    if (dayTimings) {
      const from = dayTimings.from;
      const to = dayTimings.to;

      const resultArray = createSlots(from, to, wantedToBookSlot.duration, dayDate);

      if (resultArray.length > 0) {
        arr.push({ date: { day, date, month, year }, slots: resultArray });
      } else {
        arr.push({ date: { day, date, month, year }, slots: ["Store is closed"] });
      }
    } else {
      arr.push({ date: { day, date, month, year }, slots: ["Store is closed"] });
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return res.status(200).json({ status: true, data: arr });
});

function isSlotBooked(slotTime, bookedSlots, date, eachSlotsAllowed) {
  const time = moment(slotTime, "hh:mma");
  let bookedCount = 0;
  for (const bookedSlot of bookedSlots) {
    if (date === bookedSlot.date) {
      const bookedTime = moment(bookedSlot.start, "hh:mma");
      const endTime = bookedTime.clone().add(bookedSlot.duration, "minutes");
      if (time.isSameOrAfter(bookedTime) && time.isBefore(endTime)) {
        bookedCount++;
        if (bookedCount >= eachSlotsAllowed) {
          return true; // Slot is booked
        }
      }
    }
  }
  return false; // Slot is available
}






export { getStoreAvailableSlots };
