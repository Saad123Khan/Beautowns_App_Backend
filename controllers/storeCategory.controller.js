import asyncHandler from "#middlewares/asyncHandler";
import {
  StoreCategories,
  validateStoreCategories,
} from "#models/store_categories_model";
import { Store } from "#models/store_model";
import { Service } from "#models/services_model";
import { PATH, LIVEPATH } from "#constant/constant";

const createStoreCategory = asyncHandler(async (req, res) => {
  const { error } = validateStoreCategories(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const store = await Store.findOne({
    _id: req.body.store_Id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/uploads/${image}` : "";

  const category = await new StoreCategories(req.body).save();
  if (category) {
    let categories = [];
    const storeCategories = await StoreCategories.find({
      store_Id: category?.store_Id,
      isDeleted: false,
    });
    if (storeCategories?.length > 0) {
      categories = storeCategories;
    }

    return res.status(201).send({
      status: true,
      message: "Sucessfully created store category",
      category,
      categories: categories,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something error while creating category",
    });
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  const storeCategories = await StoreCategories.find({
    store_Id: req.params.id,
    isDeleted: false,
  });
  if (storeCategories?.length > 0) {
    return res.status(200).send({ status: true, storeCategories });
  } else {
    return res.status(404).send({
      status: false,
      message: "Store Categories does not exists",
      storeCategories: [],
    });
  }
});

const getOneCategory = asyncHandler(async (req, res) => {
  const storeCategories = await StoreCategories.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (storeCategories) {
    return res.status(200).send({ status: true, storeCategories });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Service Category does not exists" });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const storeCategories = await StoreCategories.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (storeCategories) {
    return res.status(200).send({ status: true, storeCategories });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Service Category does not exists" });
  }
});

const delete_catgory = asyncHandler(async (req, res) => {
  const isCategoryExists = await StoreCategories.find({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!isCategoryExists) {
    return res
      .status(404)
      .send({ status: false, message: "Service Category does not exists" });
  }

  const findServices = await Service?.find({
    service_category_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  const delete_cat = await StoreCategories.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { isDeleted: true } }
  );

  if (delete_cat) {
    if (findServices?.length > 0) {
      await Service.updateMany(
        {
          _id: { $in: findServices.map((service) => service._id) },
        },
        {
          $set: { isDeleted: true },
        }
      );
    }

    let categories = [];
    let services = [];
    const storeCategories = await StoreCategories.find({
      store_Id: delete_cat?.store_Id,
      isDeleted: false,
    });

    if (storeCategories?.length > 0) {
      categories = storeCategories;
    }
    const findServices1 = await Service.find({
      store_Id: delete_cat?.store_Id,
      isDeleted: false,
    });

    if (findServices1?.length > 0) {
      services = findServices1;
    }

    return res.status(200).send({
      status: true,
      message: "Category Deleted Successfully!",
      categories: categories,
      services: services,
    });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Category does not exists" });
  }
});

export {
  createStoreCategory,
  getAllCategories,
  getOneCategory,
  delete_catgory,
};
