import express from 'express';
import { createStoreCategory,getAllCategories ,getOneCategory,delete_catgory } from '#controllers/storeCategory.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const storeCategoryRoute = express.Router();
storeCategoryRoute.route('/').post(multerUpload.single('image'),createStoreCategory);
storeCategoryRoute.route('/store/:id').get(validateObjectId,getAllCategories);
storeCategoryRoute.route('/:id').get(validateObjectId,getOneCategory);
storeCategoryRoute.route('/:id').delete(validateObjectId,delete_catgory);

export default storeCategoryRoute;