import asyncHandler from "#middlewares/asyncHandler";
import { Categories, validateCategories} from "#models/category_model";
import { PATH } from "#constant/constant";

const createCategory = asyncHandler(async (req, res) => {
    const { error } = validateCategories(req.body);
    if (error) {
        return res
            .status(400)
            .send({ status: false, message: error?.details[0]?.message });
    }

    const image = req?.file?.filename;
    req.body.image = image ? `${PATH}/uploads/${image}` : ''
  
    const category = await new Categories(req.body).save();
    
    if (category) {
        return res
            .status(201)
            .send({ status: true, message: "Sucessfully created category" });
    }
    else {
        return res
            .status(400)
            .send({ status: false, message: "Something error while creating category" });
    }

})

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Categories.find({isDeleted:false,isSuspend:false});
    if (categories?.length > 0) {
        return res
            .status(200)
            .send({ status: true, categories});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Categories does not exists" , categories:[]});
    }

})


const getOneCategory = asyncHandler(async (req, res) => {
    const categories = await Categories.findOne({_id: req.params.id ,isDeleted:false,isSuspend:false});
    
    if (categories) {
        return res
            .status(200)
            .send({ status: true, categories});
    }
    else {
        return res
            .status(404)
            .send({ status: false, message: "Category does not exists"});
    }

})

export { createCategory,getAllCategories ,getOneCategory }