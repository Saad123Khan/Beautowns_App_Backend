import asyncHandler from "#middlewares/asyncHandler";
import { Service, validateServices } from "#models/services_model";
import { Store } from "#models/store_model";
import { StoreCategories } from "#models/store_categories_model";
import { PATH, LIVEPATH } from "#constant/constant";
import Joi from "joi";

function validateUpdateServices(service) {
  const schema = Joi.object({
    service_category_Id: Joi.string(),
    name: Joi.string(),
    description: Joi.string(),
    value: Joi.number(),
    // noOfPeople: Joi.number(),
    segment_Id: Joi.number().valid(1, 2, 3),
    duration: Joi.number(),
    image: Joi.string(),
    isDeleted: Joi.boolean(),
    isSuspend: Joi.boolean(),
  });

  return schema.validate(service);
}

const createService = asyncHandler(async (req, res) => {
  let services = [];
  const { error } = validateServices(req.body);
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

  const storeCategory = await StoreCategories.findOne({
    _id: req.body.service_category_Id,
    store_Id: req.body.store_Id,
    isDeleted: false,
  });

  if (!storeCategory) {
    return res.status(404).send({
      status: false,
      message: "Store Service Category record not exists",
    });
  }

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/uploads/${image}` : "";

  const service = await new Service(req.body).save();
  if (service) {
    const findServics = await Service.find({
      store_Id: service?.store_Id,
      isDeleted: false,
      isSuspend: false,
    }).populate("service_category_Id");
    if (findServics.length > 0) {
      services = findServics;
    }
    return res.status(201).send({
      status: true,
      message: "Sucessfully created service",
      service,
      services: services,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something Error while creating service",
    });
  }
});

const updateService = asyncHandler(async (req, res) => {
  let services = [];
  const { error } = validateUpdateServices(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const serviceFind = await Service.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (!serviceFind) {
    return res
      .status(404)
      .send({ status: false, message: "Service record not exists" });
  }

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/uploads/${image}` : serviceFind?.image;

  const service = await Service.findByIdAndUpdate(serviceFind?._id, req.body, {
    new: true,
  });
  if (service) {
    const findServics = await Service.find({
      ...(req.query.role !== "admin" && { store_Id: service?.store_Id}),
      isDeleted: false,
      isSuspend: false,
    }).populate("service_category_Id");
    if (findServics.length > 0) {
      services = findServics;
    }
    return res.status(200).send({
      status: true,
      message: "Sucessfully updated service",
      service,
      services: services,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something Error while updating service",
    });
  }
});

const getAllStoreServices = asyncHandler(async (req, res) => {
  if (req.query.role !== "admin") {
    const store = await Store.findOne({
      _id: req.params.id,
      isSuspend: false,
      isDeleted: false,
    });

    if (!store) {
      return res
        .status(404)
        .send({ status: false, message: "Store record not exists" });
    }
  }

  const service = await Service.find({
    ...(req.query.role !== "admin" && { store_Id: req.params.id }),
    isDeleted: false,
    isSuspend: false,
  }).populate("service_category_Id");
  if (service?.length > 0) {
    return res.status(200).send({ status: true, service });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Service does not exists", service: [] });
  }
});

const getServiceSpecific = asyncHandler(async (req, res) => {
  const services = await Service.find({
    _id: { $in: req.body.service_Ids },
    isDeleted: false,
    isSuspend: false,
  });

  if (services?.length > 0) {
    return res.status(200).send({ status: true, services });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Service does not exists" });
  }
});

const getOneService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  }).populate("service_category_Id");

  if (service) {
    return res.status(200).send({ status: true, service });
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Service does not exists" });
  }
});

const delete_service = asyncHandler(async (req, res) => {
  let services = [];
  const isExist = await Service.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });

  if (isExist) {
    const delete_service = await Service.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    );

    if (delete_service) {
      const findServics = await Service.find({
        ...(req.query.role !== "admin" && { store_Id: isExist?.store_Id }),
        isDeleted: false,
        isSuspend: false,
      }).populate("service_category_Id");
      if (findServics.length > 0) {
        services = findServics;
      }
      return res.status(200).send({
        status: true,
        message: "Service Deleted Successfully!",
        services: services,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Something Wents Wrong While Deleting Service",
      });
    }
  } else {
    return res
      .status(404)
      .send({ status: false, message: "Service does not exists" });
  }
});

export {
  createService,
  getAllStoreServices,
  getOneService,
  updateService,
  getServiceSpecific,
  delete_service,
};
