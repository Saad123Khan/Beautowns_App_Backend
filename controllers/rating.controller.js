import asyncHandler from "#middlewares/asyncHandler";
import { Store } from "#models/store_model";
import { User } from "#models/user_model";
import { Rating, validateRating } from "#models/rating_model";
import _ from "lodash";
import { Booking } from "#models/booking_model";

const giveRating = asyncHandler(async (req, res) => {
  const { error } = validateRating(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const isBookingExist = await Booking.findOne({ _id: req.body.booking_Id });

  if (!isBookingExist) {
    return res.status(404).send({
      status: false,
      message: "Booking not exists",
    });
  }
//   const isAlreadyRated = await Rating.findOne({ booking_Id: req.body.booking_Id });

//   if (isAlreadyRated) {
//     return res.status(500).send({
//       status: false,
//       message: "This booking is already rated",
//     });
//   }

  const isUserExist = await User.findOne({ _id: req.body.user_Id });

  if (
    JSON.stringify(isBookingExist?.user_Id) === JSON.stringify(isUserExist._id)
  ) {
    const findStore = await Store.findById(isBookingExist?.store_Id);

    if (findStore) {
      const userRating = req.body.rating;
      req.body.store_Id = isBookingExist?.store_Id;

      // Create a new rating entry
      const newRating = new Rating(req.body);
      await newRating.save();
      let multi = findStore.totalRatings * findStore.rating;
      let add = multi + userRating;
      let div = (add / findStore.totalRatings + 1) ;
      findStore.totalRatings += 1;
      findStore.rating = div;

      // Save the updated store
      await findStore.save();

      return res.status(200).send({
        status: true,
        message: "Rating submitted successfully",
        newRating: userRating,
        findStore,
      });
    }
  }

  return res
    .status(404)
    .send({ status: false, message: "something went wrong while rating" });
});

const getStoreRating = asyncHandler(async (req, res) => {
  const isRating = await Rating.find({ store_Id: req.params.id });

  if (isRating) {
    return res.status(200).send({
      status: true,
      rating: isRating,
    });
  } else {
    return res.status(200).send({
      status: false,
      message: "This salon not rated yet",
    });
  }
});

export { giveRating, getStoreRating };
