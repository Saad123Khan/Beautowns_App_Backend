import express from "express";
import {
  generatePayroll,
  getStaffPayroll,
  getAllStaffPayroll
} from "#controllers/staffPayroll.controller";
import validateObjectId from "#middlewares/validateObjectId";

const staffPayrollRoutes = express.Router();
staffPayrollRoutes.route("/").post(generatePayroll);
staffPayrollRoutes.route("/staff/:id").get(validateObjectId, getStaffPayroll);
staffPayrollRoutes.route("/store/:id").get(validateObjectId, getAllStaffPayroll);

export default staffPayrollRoutes;
