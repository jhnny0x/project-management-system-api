const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const TaskRequest = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    deadline: Joi.date(),
    assigned_to: Joi.objectId(),
    checked_by: Joi.objectId(),
    project_id: Joi.objectId(),
    status_id: Joi.objectId().required()
})

module.exports = { TaskRequest }