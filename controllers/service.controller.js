import asyncHandler from "#middlewares/asyncHandler";
import { Service, validateServices } from "#models/services_model";
import { Store } from "#models/store_model";
import { StoreCategories} from "#models/store_categories_model";
import { PATH } from "#constant/constant";
import Joi from "joi";

function validateUpdateServices(service) {
    const schema = Joi.object({
        service_category_Id: Joi.string(),
        name: Joi.string(),
        description: Joi.string(),
        value: Joi.number(),
        noOfPeople: Joi.number(),
        segment_Id: Joi.number().valid(1, 2, 3),
        duration: Joi.number(),
        image: Joi.string(),
        isDeleted: Joi.boolean(),
        isSuspend: Joi.boolean(),
        
    });

    return schema.validate(service);
}


const createService = asyncHandler(async (req, res) => {
    const { error } = validateServices(req.body);
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

      const storeCategory = await StoreCategories.findOne({_id:req.body.service_category_Id, store_Id:req.body.store_Id, isDeleted:false})

      if (!storeCategory) {
       return res
           .status(404)
           .send({ status: false, message: "Store Service Category record not exists" });
       }

       

  const image = req?.file?.filename;
  req.body.image = image ? `${PATH}/uploads/${image}` : ''

    const service = await new Service(req.body).save();
    if (service) {
        return res
            .status(201)
            .send({ status: true, message: "Sucessfully created service",service });
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something Error while creating service" });
    }

})


const updateService = asyncHandler(async (req, res) => {
    const { error } = validateUpdateServices(req.body);
    if (error) {
        return res
            .status(400)
            .send({ status: false, message: error?.details[0]?.message });
    }


      const serviceFind = await Service.findOne({_id:req.params.id, isDeleted:false,isSuspend:false})

      if (!serviceFind) {
       return res
           .status(404)
           .send({ status: false, message: "Service record not exists" });
       }

       

  const image = req?.file?.filename;
  req.body.image = image ? `${PATH}/uploads/${image}` : serviceFind?.image
  
    const service = await Service.findByIdAndUpdate(serviceFind?._id,req.body,{new:true});
    if (service) {
        return res
            .status(200)
            .send({ status: true, message: "Sucessfully updated service",service,service });
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something Error while updating service" });
    }

})
const getAllStoreServices = asyncHandler(async (req, res) => {
    const store = await Store.findOne({_id:req.params.id,isSuspend : false , isDeleted:false})

    if (!store) {
     return res
         .status(404)
         .send({ status: false, message: "Store record not exists" });
     }

    const service = await Service.find({ store_Id : req.params.id, isDeleted:false,isSuspend:false});
    if (service?.length > 0) {
        return res
            .status(200)
            .send({ status: true, service});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Service does not exists" , service:[]});
    }

})


const getOneService = asyncHandler(async (req, res) => {
    const service = await Service.findOne({_id: req.params.id ,isDeleted:false,isSuspend:false});
    
    if (service) {
        return res
            .status(200)
            .send({ status: true, service});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Service does not exists"});
    }

})

export { createService,getAllStoreServices ,getOneService ,updateService}