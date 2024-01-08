import Joi from "joi";

export const ProductSchema = Joi.object({
    name:Joi.string().required(),
    img:Joi.string().required(),
    price:Joi.number().required(),
    description:Joi.string().required(),
    height:Joi.number().required(),
    weight:Joi.number().required(),
    categoryId: Joi.string().required(),
    originId:Joi.string().required(),
    materialId:Joi.string().required()  
})