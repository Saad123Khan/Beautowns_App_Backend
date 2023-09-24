import express from 'express';
import { createStaff , getAllStoreStaffs , getOneStaff } from '#controllers/staff.controller';
import validateObjectId from "#middlewares/validateObjectId";

const staffRoute = express.Router();

staffRoute.route('/').post(createStaff).get(getAllStoreStaffs);
staffRoute.route('/:id').get(validateObjectId,getOneStaff);

export default staffRoute;