import mongoose from "mongoose";

const validateObjectId = (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send( {status : false , message : 'Invalid ID.'});
  next();
}
export const validateObjectIdBody = (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send( {status : false , message : 'Invalid ID.'});
  next();
}

export default validateObjectId