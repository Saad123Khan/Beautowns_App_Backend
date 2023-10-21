import asyncHandler from "#middlewares/asyncHandler";
import {
  Store,
  validateStores,
  StoreTime,
  ValidateStoreTime,
  StoreDocuments,
  ValidateStoreDocument,
} from "#models/store_model";
import { Service } from "#models/services_model";
import { Staffs } from "#models/staff_model";
import { User } from "#models/user_model";
import { Categories } from "#models/category_model";

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

  //     const categoryFind = await Categories.findOne({_id:  req.body.category_Id,isSuspend : false , isDeleted:false})

  //     if (!categoryFind) {
  //      return res
  //          .status(404)
  //          .send({ status: false, message: "Category record not exists" });
  //  }

  if (!storeOwnerFind?.isVerified) {
    return res
      .status(403)
      .send({ status: false, message: "Store owner not verified" });
  }

  const store = await new Store(req.body).save();
  if (store) {
    const updatedStore = await Store.findByIdAndUpdate(
      store._id,
      {
        $set: { store_pofile_progess: 1 },
      },
      { new: true }
    );
    return res.status(201).send({
      status: true,
      message: "Sucessfully created store",
      store: updatedStore,
    });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Something Error while creating store" });
  }
});

const createStoreTiming = asyncHandler(async (req, res) => {
  const { error } = ValidateStoreTime(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const isStoreExist = await Store.find({
    _id: req.body.store_id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStoreExist) {
    return res.status(400).send({ status: false, message: "Store Not Exist" });
  }

  const saveTiming = await new StoreTime(req.body).save();

  if (saveTiming) {
    const updatedStore = await Store.findByIdAndUpdate(
      req.body.store_id,
      {
        $set: { store_pofile_progess: 2 },
      },
      { new: true }
    );
    return res.status(201).send({
      status: true,
      message: "Sucessfully Saved Store Timing",
      store: updatedStore,
    });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Something Error while Saving Time" });
  }
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
      message: "Sucessfully Updated Store Status",
    });
  } else {
    return res
      .status(400)
      .send({
        status: false,
        message: "Something Error while Changing Store Status",
      });
  }
});

const createStoreDocuments = asyncHandler(async (req, res) => {
  const { error } = ValidateStoreDocument({
    store_id: req.params.id,
    images: req.body.images,
  });
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const isStoreExist = await Store.find({
    _id: req.body.store_id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!isStoreExist) {
    return res.status(400).send({ status: false, message: "Store Not Exist" });
  }

  const saveDocuments = await new StoreDocuments({
    store_id: req.params.id,
    images: req.body.images,
  }).save();

  if (saveDocuments) {
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      {
        $set: { store_pofile_progess: 3 },
      },
      { new: true }
    );
    return res.status(201).send({
      status: true,
      message: "Sucessfully Saved Store Dcouments",
      store: updatedStore,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something Error while Saving Dcouments",
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
  const store = await Store.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

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

const getStoreTiming = asyncHandler(async (req, res) => {
  const store_time = await StoreTime.findOne({
    store_id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (store_time) {
    return res.status(200).send({ status: true, storeTime: store_time });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store Time record does not exists",
      storeData: [],
    });
  }
});

const getStoreDocuments = asyncHandler(async (req, res) => {
  const store_docs = await StoreDocuments.findOne({
    store_id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (store_docs) {
    return res.status(200).send({ status: true, storeDocs: store_docs });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store Documents record does not exists",
      storeData: [],
    });
  }
});

export {
  createStore,
  getAllStore,
  getOneStore,
  createStoreTiming,
  getStoreTiming,
  createStoreDocuments,
  getStoreDocuments,
  changeStoreStatus,
};
