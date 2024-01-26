import express from "express";
import { getAllCategories } from "#controllers/storeCategory.controller";

const storeCategoryRoute = express.Router();

storeCategoryRoute.route("/").get(getAllCategories);

export default storeCategoryRoute;
