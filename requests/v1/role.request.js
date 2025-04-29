const Joi = require('joi')

const CreateRoleRequest = Joi.object({
    name: Joi.string().required()
})

const permission = Joi.object({
    can_activate: Joi.number().valid(0, 1).required(),
    can_create: Joi.number().valid(0, 1).required(),
    can_update: Joi.number().valid(0, 1).required(),
    can_delete: Joi.number().valid(0, 1).required(),
})

const UpdateRoleRequest = Joi.object({
    name: Joi.string().required(),
    module_name: Joi.string().required(),
    permission: permission.required()
})

module.exports = { CreateRoleRequest, UpdateRoleRequest }