import Joi from "joi";


export const schemaCart = Joi.object({
    userId: Joi.string().required(),
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    // price: Joi.number().min(0).required()
});