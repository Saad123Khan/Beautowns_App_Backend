import asyncHandler from "#middlewares/asyncHandler";
import { Service, validateServices } from "#models/services_model";
import { Store } from "#models/store_model";

import { StoreCategories} from "#models/store_categories_model";

const createService = asyncHandler(async (req, res) => {
    const { error } = validateServices(req.body);
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

      const storeCategory = await StoreCategories.findOne({store_category_Id:req.body.store_category_Id,isSuspend : false , isDeleted:false})

      if (!storeCategory) {
       return res
           .status(404)
           .send({ status: false, message: "Store Category record not exists" });
       }

    const service = await new Service(req.body).save();
    if (service) {
        return res
            .status(201)
            .send({ status: true, message: "Sucessfully created service" });
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something Error while creating service" });
    }

})

const getAllStoreServices = asyncHandler(async (req, res) => {
    const store = await Store.findOne({storeId:req.params.id,isSuspend : false , isDeleted:false})

    if (!store) {
     return res
         .status(404)
         .send({ status: false, message: "Store record not exists" });
     }

    const service = await Service.find({ storeId : req.params.id, isDeleted:false,isSuspend:false});
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

export { createService,getAllStoreServices ,getOneService }