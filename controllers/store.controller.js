import asyncHandler from "#middlewares/asyncHandler";
import {
  Store,
  validateStores,
} from "#models/store_model";
import { PATH } from "#constant/constant";
import { Service } from "#models/services_model";
import { Staffs } from "#models/staff_model";
import _ from "lodash";
import { User } from "#models/user_model";
import { Categories } from "#models/category_model";
import Joi from "joi";


function validateUpdateStores(store) {
  const schema = Joi.object({
    name: Joi.string(),
    country: Joi.string(),
    city: Joi.string(),
    phone: Joi.number(),
    latitude: Joi.number(),
    longitude: Joi.number(),
    store_timings: Joi.array().items(
      Joi.object({
        day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
        from: Joi.string().regex(/^([1-9]|1[0-2]):[0-5][0-9][ap]m$/i).required(),
        to: Joi.string().regex(/^([1-9]|1[0-2]):[0-5][0-9][ap]m$/i).required(),
        isAvailable: Joi.boolean().required(),
      })
    ).min(7).max(7).unique('day', { ignoreUndefined: true }),
    documents: Joi.array(),
    segment_Id: Joi.number().valid(1, 2, 3),
    image: Joi.string(),
    completeProgess: Joi.number(),
    gallery: Joi.array(),
    rating: Joi.number(),
    isSuspend: Joi.boolean(),
    isDeleted: Joi.boolean(),
  });
  return schema.validate(store);
}


const createStore = asyncHandler(async (req, res) => {
  const { error } = validateStores(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  const storeOwnerFind = await User.findOne({
    _id: req.body.salon_owner_Id,
    role: "store",
    isSuspend: false,
    isDeleted: false,
  });

  const isStoreExist = await Store.find({
    salon_owner_Id: req.body.salon_owner_Id,
    isDeleted: false,
    isSuspend: false,
  });

  if (isStoreExist?.length > 0) {
    return res
      .status(400)
      .send({ status: false, message: "Your Store is already Registered." });
  }

  if (!storeOwnerFind) {
    return res
      .status(404)
      .send({ status: false, message: "Store owner record not exists" });
  }

  const categoryFind = await Categories.findOne({ _id: req.body.category_Id, isSuspend: false, isDeleted: false })

  if (!categoryFind) {
    return res
      .status(404)
      .send({ status: false, message: "Category record not exists" });
  }

  if (!storeOwnerFind?.isVerified) {
    return res
      .status(403)
      .send({ status: false, message: "Store owner not verified" });
  }


  const image = req?.file?.filename;
  req.body.image = image ? `${PATH}/uploads/${image}` : ''

  const store = await new Store(req.body).save();

  if (store) {
    return res.status(201).send({
      status: true,
      message: "Sucessfully created store",
      store: store,
    });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Something Error while creating store" });
  }
});


const updateStore = asyncHandler(async (req, res) => {
console.log(req.files,"FILES")
  const { error } = validateUpdateStores(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }
  const isStoreExist = await Store.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStoreExist) {
    return res.status(400).send({ status: false, message: "Store not exist" });
  }

  const documentUrls = [];
  if (req?.files?.documents) {
    req?.files?.documents?.forEach((document) => {
      const documentUrl = `${PATH}/uploads/${document?.filename}`;
      documentUrls.push(documentUrl);
    });
  }

  req.body.documents = documentUrls?.length > 0 ? [...documentUrls,...isStoreExist?.documents] : isStoreExist?.documents

  const galleryUrls = [];
  if (req?.files?.gallery) {
    req?.files?.gallery?.forEach((galleryImage) => {
      const galleryImageUrl = `${PATH}/uploads/${galleryImage?.filename}`;
      galleryUrls.push(galleryImageUrl);
    });
  }
    
  req.body.gallery = galleryUrls?.length > 0 ? [...galleryUrls,...isStoreExist?.gallery] : isStoreExist?.gallery

   const imageUrls = [];
   if (req?.files?.image) {
     req?.files?.image.forEach((image) => {
       const imageUrl = `${PATH}/uploads/${image?.filename}`;
       imageUrls.push(imageUrl);
     });
   }


   req.body.image = imageUrls?.length > 0 ? imageUrls?.[0] : isStoreExist?.image

 let updatedStore = await Store.findByIdAndUpdate(
    isStoreExist?._id,
     _.pick(req.body, ["segment_Id","name","country", "city", "phone","latitude","longitude","image","documents","gallery","store_timings","completeProgess"]),     
     { new: true }
     );
    return res.status(200).send({
      status: true,
      message: "Updated store details successfully",
      store: updatedStore,
    });

});


const changeStoreStatus = asyncHandler(async (req, res) => {
  const isStoreExist = await Store.find({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStoreExist) {
    return res.status(400).send({ status: false, message: "Store Not Exist" });
  }

  if (isStoreExist) {
    await Store.findByIdAndUpdate(req.params.id, {
      $set: { isActive: req?.body?.status },
    });
    return res.status(200).send({
      status: true,
      message: "Sucessfully verified successfully",
    });
  } else {
    return res
      .status(400)
      .send({
        status: false,
        message: "Something Error while verifying store",
      });
  }
});


const getAllStore = asyncHandler(async (req, res) => {
  const store = await Store.find({ isDeleted: false, isSuspend: false });
  if (store?.length > 0) {
    return res.status(200).send({ status: true, store: store });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store record does not exists",
      store: [],
    });
  }
});

const getOneStore = asyncHandler(async (req, res) => {
 
  let store ;
  if(req.query.type === "owner")
  {
    store = await Store.findOne({
      salon_owner_Id: req.params.id,
      isDeleted: false,
      isSuspend: false,
    });
  }
  else if(req.query.type === "store")
  {
    store = await Store.findOne({
      _id: req.params.id,
      isDeleted: false,
      isSuspend: false,
    });
  }
  else{
    return res.status(404).send({
      status: false,
      message: "Invalid type",
      storeData: [],
    });
  }
 
  if (store) {
    const services = await Service.find({
      store_Id: store?._id,
      isDeleted: false,
      isSuspend: false,
    });
    const staff = await Staffs.find({
      store_Id: store?._id,
      isDeleted: false,
      isSuspend: false,
    });

    const data = { store, services, staff };
    return res.status(200).send({ status: true, storeData: data });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store record does not exists",
      storeData: [],
    });
  }
});


export {
  createStore,
  getAllStore,
  getOneStore,
  changeStoreStatus,
  updateStore
};
