import express from "express";
import {
  createMemberships,
  getAllMemberships,
} from "#controllers/membership.controller";

const membershipRoute = express.Router();
membershipRoute.route("/").post(createMemberships);
membershipRoute.route("/:store_id").get(getAllMemberships);

export default membershipRoute;
