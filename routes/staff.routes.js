import express from 'express';
import { createStaff , getAllStoreStaffs , getOneStaff } from '#controllers/staff.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const staffRoute = express.Router();

staffRoute.route('/').post(multerUpload.single('image'),createStaff);

staffRoute.route('/store/:id').get(validateObjectId,getAllStoreStaffs);


staffRoute.route('/:id').get(validateObjectId,getOneStaff);

export default staffRoute;