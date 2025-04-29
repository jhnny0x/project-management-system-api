const JWT = require('jsonwebtoken')
const httpErrors = require('http-errors')

module.exports = {
    signAccessToken: user_id => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '3h',
                issuer: 'project.management.system.com',
                audience: user_id.toString()
            }
            
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    const message = err.name == 'JsonWebTokenError' ? 'Unauthorized' : err.message
                    return next(httpErrors.Unauthorized(message))
                }
                   
                resolve(token)
            })
        })
    }
}