import asyncHandler from "#middlewares/asyncHandler";
import { Categories } from "#models/category_model";

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

export { getAllCategories };
