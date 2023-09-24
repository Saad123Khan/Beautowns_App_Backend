import express from 'express';
import { createStore , getAllStore , getOneStore } from '#controllers/store.controller';
import validateObjectId from "#middlewares/validateObjectId";
import { multerUpload } from '#utils/multer';

const storeRoute = express.Router();

storeRoute.route('/').post(multerUpload.array('images'),createStore).get(getAllStore);
storeRoute.route('/:id').get(validateObjectId,getOneStore);

export default storeRoute ;