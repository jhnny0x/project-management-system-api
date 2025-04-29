const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const UserRequest = Joi.object({
    first_name: Joi.string().required(),
    middle_name: Joi.string(),
    last_name: Joi.string().required(),
    suffix: Joi.string(),
    is_active: Joi.boolean().required(),
    role_id: Joi.objectId().required()
})

module.exports = { UserRequest }