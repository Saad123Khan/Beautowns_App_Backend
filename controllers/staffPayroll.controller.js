import asyncHandler from "#middlewares/asyncHandler";
import {
  StaffPayroll,
  validateStaffPayroll,
} from "#models/staff_payroll_model";
import { Store } from "#models/store_model";
import { Staffs } from "#models/staff_model";

const generatePayroll = asyncHandler(async (req, res) => {
  console.log(req.body, "req");
  const { error } = validateStaffPayroll(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  const isStoreExist = await Store.findOne({
    _id: req.body.store_Id,
    isSuspend: false,
    isDeleted: false,
  });
  if (!isStoreExist) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }
  const isStaffExist = await Staffs.findOne({
    _id: req.body.staff_Id,
    isSuspend: false,
    isDeleted: false,
  });
  if (!isStaffExist) {
    return res
      .status(404)
      .send({ status: false, message: "Staff record not exists" });
  } else {
    const payroll = await new StaffPayroll(req.body).save();
    if (payroll) {
      return res.status(201).send({
        status: true,
        message: "Sucessfully created staff payroll",
        payroll,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Something error while creating payroll",
      });
    }
  }
});

const getStaffPayroll = asyncHandler(async (req, res) => {
  const isStaffExist = await Staffs.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });
  if (!isStaffExist) {
    return res
      .status(404)
      .send({ status: false, message: "Staff record not exists" });
  }

  const staffPayroll = await StaffPayroll.find({
    staff_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });
  if (staffPayroll?.length > 0) {
    return res.status(200).send({ status: true, staffPayroll });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Staff Payroll does not exists" });
  }
});

const getAllStaffPayroll = asyncHandler(async (req, res) => {
  const isStoreExist = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });
  if (!isStoreExist) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const staffPayroll = await StaffPayroll.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate({path:"staff_Id",select:"name title"});

  if (staffPayroll?.length > 0) {
    return res.status(200).send({ status: true, staffPayroll });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Staff Payroll does not exists" });
  }
});

export { generatePayroll, getStaffPayroll, getAllStaffPayroll };
