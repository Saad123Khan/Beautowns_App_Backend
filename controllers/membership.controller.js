import asyncHandler from "#middlewares/asyncHandler";
import { MemberShips, validateMembership } from "#models/membership_model";
import { Store } from "#models/store_model";
import { Service } from "#models/services_model";
const createMemberships = asyncHandler(async (req, res) => {
  const { error } = validateMembership(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  // const store = await Store.findOne({
  //   _id: req.body.store_Id,
  //   isSuspend: false,
  //   isDeleted: false,
  // });

  // if (!store) {
  //   return res
  //     .status(404)
  //     .send({ status: false, message: "Store record not exists" });
  // }

  const service = await Service.find({isDeleted:false,isSuspend:false});
    

  // const membership = await new MemberShips(req.body).save();
  if (service) {
    return res
      .status(201)
      .send({ status: true, message: "Sucessfully created membership",service:service });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something error while creating membership",
    });
  }
});

const getAllMemberships = asyncHandler(async (req, res) => {
  // const store = await Store.findOne({
  //   _id: req.params.store_id,
  //   isSuspend: false,
  //   isDeleted: false,
  // });

  // if (!store) {
  //   return res
  //     .status(404)
  //     .send({ status: false, message: "Store record not exists" });
  // }



  const membership = await MemberShips.find({
    store_Id: req.params.store_id,
    // isDeleted: false,
    // isSuspend: false,
  });
  if (membership?.length > 0) {
    return res.status(200).send({ status: true, membership });
  } else {
    return res.status(404).send({
      status: false,
      message: "Memberships does not exists",
      membership: [],
    });
  }
});

export { createMemberships, getAllMemberships };
