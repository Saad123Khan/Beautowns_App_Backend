import express from 'express';
import { createService , getAllStoreServices , getOneService } from '#controllers/service.controller';
import validateObjectId from "#middlewares/validateObjectId";

const serviceRoute = express.Router();

serviceRoute.route('/').post(createService).get(getAllStoreServices);
serviceRoute.route('/:id').get(validateObjectId,getOneService);

export default serviceRoute;