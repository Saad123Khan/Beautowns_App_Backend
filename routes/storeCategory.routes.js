import express from 'express';
import { createStoreCategory,getAllCategories ,getOneCategory } from '#controllers/storeCategory.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const storeCategoryRoute = express.Router();

storeCategoryRoute.route('/').post(multerUpload.single('image'),createStoreCategory).get(getAllCategories);
storeCategoryRoute.route('/:id').get(validateObjectId,getOneCategory);

export default storeCategoryRoute;