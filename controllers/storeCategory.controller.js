import asyncHandler from "#middlewares/asyncHandler";
import { StoreCategories, validateStoreCategories} from "#models/store_categories_model";
import { Store } from "#models/store_model";

const createStoreCategory = asyncHandler(async (req, res) => {
    const { error } = validateStoreCategories(req.body);
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

 

    const category = await new StoreCategories(req.body).save();
    if (category) {
        return res
            .status(201)
            .send({ status: true, message: "Sucessfully created store category" });
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something error while creating category" });
    }

})

const getAllCategories = asyncHandler(async (req, res) => {
    const storeCategories = await StoreCategories.find({ store_Id:req.params.id,isDeleted:false});
    if (storeCategories?.length > 0) {
        return res
            .status(200)
            .send({ status: true, storeCategories});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Store Categories does not exists" , storeCategories:[]});
    }

})


const getOneCategory = asyncHandler(async (req, res) => {
    const storeCategories = await StoreCategories.findOne({_id: req.params.id ,isDeleted:false});
    
    if (storeCategories) {
        return res
            .status(200)
            .send({ status: true, storeCategories});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Store Category does not exists"});
    }

})

export { createStoreCategory,getAllCategories ,getOneCategory }