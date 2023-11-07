import asyncHandler from "#middlewares/asyncHandler";
import { Staffs, validateStaff} from "#models/staff_model";
import { Store  } from "#models/store_model";
import { User } from "#models/user_model";
import _ from "lodash";
import bcrypt from "bcryptjs";
import { PATH } from "#constant/constant";
import Joi from "joi";


function validateUpdatedStaff(service) {
    const schema = Joi.object({
        store_Id: Joi.string(),
        salon_staff_Id: Joi.string(),
        title: Joi.string(),
        name: Joi.string(),
        gender: Joi.string().valid('male', 'female', 'other'),
        description: Joi.string(),
        
    phone: Joi.number(),
        workingSchedule: Joi.array().items(
            Joi.object({
                day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
                from: Joi.string().regex(/^([1-9]|1[0-2]):[0-5][0-9][ap]m$/i).required(),
                to: Joi.string().regex(/^([1-9]|1[0-2]):[0-5][0-9][ap]m$/i).required(),
                isAvailable: Joi.boolean().required(),
            })
        ).min(7).max(7).unique('day', { ignoreUndefined: true }),
        image: Joi.string(),
        isDeleted: Joi.boolean(),
        isSuspend: Joi.boolean(),
    });
    return schema.validate(service);
}

const createSalonStaff = asyncHandler(async (req, res) => {

    const { email,password , ...rest} = req.body;

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
    
    const image = req?.file?.filename;
    req.body.image = image ? `${PATH}/uploads/${image}` : ''
  
    let createStaff = await User.findOne({ email: req.body.email , isDeleted : false , isSuspend:false });
    if (createStaff) {
      return res
        .status(400)
        .send({ status: false, message: "Email already exists." });
    } 
    else {
        req.body.role = "staff"
        createStaff = await new User(
        _.pick(req.body, ["role", "name","gender", "email", "password","image"])
      ).save();
    }

    req.body.salon_staff_Id = createStaff?._id
 
    const staff = await new Staffs(req.body).save();
    if (staff) {
        return res
            .status(201)
            .send({ status: true, message: "Sucessfully created Staff" ,staff});
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something error while creating Staff" });
    }

})


const updateStaff = asyncHandler(async (req, res) => {
    const { error } = validateUpdatedStaff(req.body);
    if (error) {
      return res
        .status(400)
        .send({ status: false, message: error?.details[0]?.message });
    }

    const isStaffExist = await Staffs.findOne({
      _id: req.params.id,
      isDeleted: false,
      isSuspend: false,
    });
  
    if (!isStaffExist) {
      return res.status(400).send({ status: false, message: "Staff not exist" });
    }
   let updatedStaff = await Staffs.findByIdAndUpdate(
      isStaffExist?._id,
       _.pick(req.body, ["name","phone","title","description","image","gender","workingSchedule"]),     
       { new: true }
       );
      return res.status(200).send({
        status: true,
        message: "Updated staff details successfully",
        staff: updatedStaff,
      });
  
  });

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
    const staff = await Staffs.findOne({_id: req.params.id ,isDeleted:false,isSuspend:false});
    
    if (staff) {
        return res
            .status(200)
            .send({ status: true, staff});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Staff does not exists"});
    }

})

export { createSalonStaff,getAllStoreStaffs ,getOneStaff ,updateStaff }