import asyncHandler from "#middlewares/asyncHandler";
import { Categories, validateCategories } from "#models/category_model";
import { PATH, LIVEPATH } from "#constant/constant";

const createCategory = asyncHandler(async (req, res) => {
  const { error } = validateCategories(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const image = req?.file?.filename;
  req.body.image = image ? `${LIVEPATH}/uploads/${image}` : "";

  const category = await new Categories(req.body).save();

  if (category) {
    const categories = await Categories.find({
      isDeleted: false,
      isSuspend: false,
    });
    return res.status(201).send({
      status: true,
      message: "Sucessfully created category",
      categories,
    });
  } else {
    return res.status(400).send({
      status: false,
      message: "Something error while creating category",
    });
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Categories.find({
    isDeleted: false,
    isSuspend: false,
  });
  if (categories?.length > 0) {
    return res.status(200).send({ status: true, categories });
  } else {
    return res.status(404).send({
      status: false,
      message: "Categories does not exists",
      categories: [],
    });
  }
});

const updateStoreCategory = asyncHandler(async (req, res) => {
  const isExist = await Categories.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });
  if (isExist) {
    isExist.name = req.body.name;
    await isExist.save();
    const categories = await Categories.find({
      isDeleted: false,
      isSuspend: false,
    });
    return res.status(200).send({
      status: true,
      message: "Updated store category successfully",
      categories,
    });
  } else {
    return res.status(404).send({
      status: false,
      message: "Category does not exists",
      categories: [],
    });
  }
});

const deleteStoreCategory = asyncHandler(async (req, res) => {
  const isExist = await Categories.findOne({
    _id: req.params.id,
    isDeleted: false,
    isSuspend: false,
  });
  if (isExist) {
    isExist.isDeleted = true;
    await isExist.save();
    const categories = await Categories.find({
      isDeleted: false,
      isSuspend: false,
    });
    return res.status(200).send({
      status: true,
      message: "Deleted store category successfully",
      categories,
    });
  } else {
    return res.status(404).send({
      status: false,
      message: "Category does not exists",
      categories: [],
    });
  }
});

export {
  createCategory,
  getAllCategories,
  updateStoreCategory,
  deleteStoreCategory,
};
