const Joi = require('joi')

const ClientRequest = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string()
})

module.exports = { ClientRequest }