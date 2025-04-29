const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const ProjectRequest = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    is_complete: Joi.boolean(),
    client_id: Joi.objectId().required()
})

module.exports = { ProjectRequest }