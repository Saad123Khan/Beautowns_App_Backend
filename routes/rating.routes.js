import express from "express";
import {giveRating,getStoreRating} from "#controllers/rating.controller";

const ratingRoute = express.Router();

ratingRoute.route("/").post(giveRating);
ratingRoute.route("/:id").get(getStoreRating);

export default ratingRoute;
