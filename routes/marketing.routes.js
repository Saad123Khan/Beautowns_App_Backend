//

import express from "express";
import { getAllStoreMarketing } from "#controllers/marketing.controller";
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from "#utils/multer";

const marketingRoute = express.Router();

marketingRoute.route("/:id").get(validateObjectId, getAllStoreMarketing);

export default marketingRoute;
