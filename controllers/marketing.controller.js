import { Marketing, validateMarketing } from "#models/marketing_model";
import { Store } from "#models/store_model";
import { User } from "#models/user_model";
import asyncHandler from "#middlewares/asyncHandler";
import { LIVEPATH } from "#constant/constant";
import fs from 'fs';

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

  const market = await Marketing?.find({
    store_Id: req.params.id,
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

const sendMarketing = asyncHandler(async (req, res) => {

  // console.log(req.files,"REQ FILE")
  // const image = req?.file?.filename;
  
  if (req.body.image == "null") {
    return res
      .status(400)
      .send({ status: false, message: "Plz capture or generate a signature first!" });
  }
  var matches = req.body.image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
  response = {};

response.type = matches[1];
response.data = new Buffer.from(matches[2], 'base64');
let decodedImg = response;
let imageBuffer = decodedImg.data;

const timestamp = Date.now();
const randomValue = Math.floor(Math.random() * 1000);
const imageName = `image-${timestamp}-${randomValue}.png`;

fs.writeFileSync("./uploads/" + imageName, imageBuffer, 'utf8');

  req.body.image = `${LIVEPATH}/uploads/${imageName}`;
  
  const { error } = validateMarketing(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const store = await Store.findOne({
    _id: req.body.store_Id,
  });

  if (!store) {
    return res
      .status(404)
      .send({ status: false, message: "Store record not exists" });
  }

  let users;
  if (req.body.target === "all") {
    users = await User.find({ isDeleted: false, role: "user" });
  } else if (req.body.target === "specific") {
    users = await User.find({
      _id: { $in: req.body.userIds },
      role: "user",
      isDeleted: false,
    });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Invalid target type" });
  }

  // console.log(users, "users");

  const market = await new Marketing(req.body).save();

  if (market) {
    let storeMarketing = [];
    const allMarket = await Marketing?.find({
      store_Id: market.store_Id,
    });

    if (allMarket?.length > 0) {
      storeMarketing = allMarket;
    }
    return res.status(200).send({
      status: true,
      message: "Market sended successfully",
      storeMarketing: storeMarketing,
    });
  } else {
    return res
      .status(400)
      .send({ status: false, message: "Something Error while creating store" });
  }
});

export { getAllStoreMarketing, sendMarketing };
