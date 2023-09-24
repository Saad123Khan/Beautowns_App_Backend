import asyncHandler from "#middlewares/asyncHandler";
import { Staffs, validateStaff} from "#models/staff_model";
import { Store  } from "#models/store_model";


const createStaff = asyncHandler(async (req, res) => {
    const { error } = validateStaff(req.body);
    if (error) {
        return res
            .status(400)
            .send({ status: false, message: error?.details[0]?.message });
    }
    const store = await Store.findOne({storeId:req.body.storeId,isSuspend : false , isDeleted:false})

    if (!store) {
     return res
         .status(404)
         .send({ status: false, message: "Store record not exists" });
     }
     const storeStaffFind = await User.findOne({_id:  req.body.salon_owner_Id ,role:'staff', isSuspend : false , isDeleted:false})

     if (!storeStaffFind) {
      return res
          .status(404)
          .send({ status: false, message: "Store staff record not exists" });
  }

    const staff = await new Staffs(req.body).save();
    if (staff) {
        return res
            .status(201)
            .send({ status: true, message: "Sucessfully created Staff" });
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something error while creating Staff" });
    }

})

const getAllStoreStaffs = asyncHandler(async (req, res) => {
    const store = await Store.findOne({storeId:req.params.id,isSuspend : false , isDeleted:false})

    if (!store) {
     return res
         .status(404)
         .send({ status: false, message: "Store record not exists" });
     }
    
    const Staff = await Staffs.find({ storeId : req.params.id, isDeleted:false,isSuspend:false});
    if (Staff?.length > 0) {
        return res
            .status(200)
            .send({ status: true, Staff});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Staff does not exists" , Staff:[]});
    }

})


const getOneStaff = asyncHandler(async (req, res) => {
    const Staff = await Staffs.findOne({_id: req.params.id ,isDeleted:false,isSuspend:false});
    
    if (Staff) {
        return res
            .status(200)
            .send({ status: true, Staff});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Staff does not exists"});
    }

})

export { createStaff,getAllStoreStaffs ,getOneStaff }