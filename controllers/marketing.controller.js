import { Marketing, validateMarketing } from "#models/marketing_model";
import { Store } from "#models/store_model";
import asyncHandler from "#middlewares/asyncHandler";

const getAllStoreMarketing = asyncHandler(async (req, res) => {
  const isStoreExist = await Store.findOne({
    _id: req.params.id,
    isSuspend: false,
    isDeleted: false,
  });

  if (!isStoreExist) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  const market = await Marketing.find({
    store_Id: req.params.id,
    isDeleted: false,
  });

  if (market?.length > 0) {
    return res.status(200).json({
      status: true,
      market,
    });
  } else {
    return res
      .status(200)
      .json({ status: true, message: "Marketing record not found" });
  }
});

export { getAllStoreMarketing };
