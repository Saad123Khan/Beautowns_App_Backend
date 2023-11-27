import asyncHandler from "#middlewares/asyncHandler";
import { Store } from "#models/store_model";
import {
  StoreNotification,
  validateNotification,
} from "#models/notification_model";
import { PATH, LIVEPATH } from "#constant/constant";

const createNotification = asyncHandler(async (req, res) => {
  const { error } = validateNotification(req.body);
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

  const create_notification = await new StoreNotification(req.body).save();
  if (create_notification) {
    return res.status(201).send({
      status: true,
      message: "Sucessfully created Notification",
      create_notification,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something error while creating  notification",
    });
  }
});

const getAllNotification = asyncHandler(async (req, res) => {
  console.log(req.params.id,"req.params.id")
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

  const notifications = await StoreNotification.find({
    store_Id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });
  if (notifications) {
    return res.status(200).send({
      status: true,
      notifications,
    });
  } else {
    return res.status(404).send({
      status: false,
      message: "Notifications Not Found",
    });
  }
});

export { createNotification,getAllNotification };
