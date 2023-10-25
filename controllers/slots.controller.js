import asyncHandler from "#middlewares/asyncHandler";
import { User } from "#models/user_model";
import { Store } from "#models/store_model";
import moment from 'moment-timezone';

//@desc Get Available Slots for the Next 6 Months
//@route /slots
//@request Get Request
//@access private

const getStoreAvailableSlots = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    role: "user",
    isDeleted: false,
    isSuspend: false
  });

  if (!user) {
    return res.status(404).json({ status: false, message: "User does not exist" });
  }

  const store = await Store.findOne({
    _id: req.query.store_id,
    isDeleted: false,
    isSuspend: false
  });

  if (!store) {
    return res.status(404).json({ status: false, message: "Store does not exist" });
  }

  const availableTimings = store.store_timings;

  const currentDate = moment.tz('Asia/Karachi'); // Set the time zone

  const endDate = new Date(currentDate);
  endDate.setMonth(endDate.getMonth() + 3);

  function createSlots(fromTime, toTime) {
    const startTime = moment(fromTime, "hh:mma").tz('Asia/Karachi'); // Set time zone
    const endTime = moment(toTime, "hh:mma").tz('Asia/Karachi'); // Set time zone
    if (endTime.isBefore(startTime)) {
      endTime.add(1, "day");
    }
    let arr = [];

    while (startTime <= endTime) {
      arr.push(new moment(startTime).format("hh:mma"));
      startTime.add(30, "minutes");
    }
    return arr;
  }

  let arr = [];
  let currentDay = new Date(currentDate);

  while (currentDay <= endDate) {
    const day = currentDay.toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', weekday: "long" }); // Set time zone
    const date = currentDay.getDate();
    const month = currentDay.toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: "long" }); // Set time zone
    const year = currentDay.getFullYear();
    const dayDate = `${day} ${date} ${month} ${year}`;
    const dayTimings = availableTimings.find((timing) => timing.day === day);

    if (dayTimings) {
      const from = dayTimings.from;
      const to = dayTimings.to;

      const resultArray = createSlots(from, to);

      if (resultArray.length > 0) {
        arr.push({date : { day ,date, month , year}  , slots: resultArray });
      } else {
        arr.push({ date : { day ,date, month , year}  , slots: ["Store is closed"] });
      }
    } else {
      arr.push({ date : { day ,date, month , year} , slots: ["Store is closed"] });
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }




  return res.status(200).json({ status: true, data : arr });
});





export { getStoreAvailableSlots };
