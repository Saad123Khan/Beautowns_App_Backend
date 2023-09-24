import asyncHandler from "#middlewares/asyncHandler";
import { Store, validateStores } from "#models/store_model";
import { Service } from "#models/services_model";
import { Staffs} from "#models/staff_model";
import { User } from "#models/user_model";
import { Categories} from "#models/category_model";

const createStore = asyncHandler(async (req, res) => {
    // const { error } = validateStores(req.body);
    // if (error) {
    //     return res
    //         .status(400)
    //         .send({ status: false, message: error?.details[0]?.message });
    // }
console.log(req.body)
   const storeOwnerFind = await User.findOne({_id:  req.body.salon_owner_Id ,role:'store', isSuspend : false , isDeleted:false})

   if (!storeOwnerFind) {
       return res
       .status(404)
       .send({ status: false, message: "Store owner record not exists" });
    }
    
    const categoryFind = await Categories.findOne({_id:  req.body.category_Id,isSuspend : false , isDeleted:false})
 
    if (!categoryFind) {
     return res
         .status(404)
         .send({ status: false, message: "Category record not exists" });
 }
    
if (!storeOwnerFind?.isVerified) {
    return res
        .status(403)
        .send({ status: false, message: "Store owner not verified"});
}



    const store = await new Store(req.body).save();
    if (store) {
        return res
            .status(201)
            .send({ status: true, message: "Sucessfully created store" });
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something Error while creating store" });
    }

})

const getAllStore = asyncHandler(async (req, res) => {
    const store = await Store.find({isDeleted:false,isSuspend:false});
    if (store?.length > 0) {
        return res
            .status(200)
            .send({ status: true, store:store});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Store record does not exists" , store:[]});
    }

})


const getOneStore = asyncHandler(async (req, res) => {
    const store = await Store.findOne({_id: req.params.id ,isDeleted:false,isSuspend:false});
   
    if (store) {
        const services = await Service.find({storeId: store?._id ,isDeleted:false,isSuspend:false});
        const staff = await Staffs.find({ storeId : store?._id, isDeleted:false,isSuspend:false});
 
        const data = {store , services , staff}
        return res
            .status(200)
            .send({ status: true, storeData : data});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Store record does not exists",storeData : []});
    }

})

export { createStore,getAllStore ,getOneStore }