import express from 'express';
import { createService , getAllStoreServices , getOneService } from '#controllers/service.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const serviceRoute = express.Router();

serviceRoute.route('/').post(multerUpload.array('gallery'),createService)

serviceRoute.route('/store/:id').get(validateObjectId,getAllStoreServices);

serviceRoute.route('/:id').get(validateObjectId,getOneService);

export default serviceRoute;