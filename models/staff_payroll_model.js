import mongoose from "mongoose";
import Joi from "joi";

const staffPayrollSchema = new mongoose.Schema(
  {
    store_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    staff_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
    salary: {
      type: Number,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
    },
    paymentDate: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspend: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function validateStaffPayroll(payroll) {
  const schema = Joi.object({
    store_Id: Joi.string().required(),
    staff_Id: Joi.string().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().required(),
    salary: Joi.number().positive().required(),
    bonus: Joi.number().default(0),
    deductions: Joi.number().default(0),
    netSalary: Joi.number().required(),
    paymentDate: Joi.date().required(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });

  return schema.validate(payroll);
}

const StaffPayroll = mongoose.model("StaffPayroll", staffPayrollSchema);

export { StaffPayroll, validateStaffPayroll };
