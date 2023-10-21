import asyncHandler from "#middlewares/asyncHandler";
import { Staffs, validateStaff} from "#models/staff_model";
import { Store  } from "#models/store_model";
import { User } from "#models/user_model";
import _ from "lodash";

const createStaff = asyncHandler(async (req, res) => {
    const createStaff = await new User(_.pick(req.body,['role','name','email','password'])).save();
    if (!createStaff) {
        return res
            .status(400)
            .send({ status: false, message: "Something error while creating staff" });
    }

    req.body.salon_staff_Id = createStaff?._id

    const { role , email , password , name , ...rest} = req.body
    const { error } = validateStaff(rest);
    if (error) {
        return res
            .status(400)
            .send({ status: false, message: error?.details[0]?.message });
    }

    const store = await Store.findOne({_id:req.body.store_Id,isSuspend : false , isDeleted:false})

    if (!store) {
     return res
         .status(404)
         .send({ status: false, message: "Store record not exists" });
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
    console.log(req.params.id)
    const store = await Store.findOne({_id:req.params.id,isSuspend : false , isDeleted:false})

    if (!store) {
     return res
         .status(404)
         .send({ status: false, message: "Store record not exists" });
     }
    
    const Staff = await Staffs.find({ store_Id : req.params.id, isDeleted:false,isSuspend:false});
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