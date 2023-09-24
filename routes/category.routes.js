import express from 'express';
import { createCategory , getAllCategories , getOneCategory } from '#controllers/category.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const categoryRoute = express.Router();

categoryRoute.route('/').post(multerUpload.single('image'),createCategory).get(getAllCategories);
categoryRoute.route('/:id').get(validateObjectId,getOneCategory);

export default categoryRoute;