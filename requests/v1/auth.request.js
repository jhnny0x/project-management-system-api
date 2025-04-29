const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const RegisterRequest = Joi.object({
    first_name: Joi.string().required(),
    middle_name: Joi.string(),
    last_name: Joi.string().required(),
    suffix: Joi.string(),
    email: Joi.string().required().lowercase().email({ 
        minDomainSegments: 2, 
        tlds: { 
            allow: ['com', 'net'] 
        } 
    }),
    role_id: Joi.objectId().required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.ref('password'),
})

const LoginRequest = Joi.object({
    email: Joi.string().required().lowercase().email({ 
        minDomainSegments: 2, 
        tlds: { 
            allow: ['com', 'net'] 
        } 
    }),
    password: Joi.string().min(6).required()
})

module.exports = { RegisterRequest, LoginRequest }