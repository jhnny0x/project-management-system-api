const JWT = require('jsonwebtoken')
const httpErrors = require('http-errors')

module.exports.verifyAccessToken = (req, res, next) => {
    const { accessToken } = req.cookies
    if (!accessToken) {
        return next(httpErrors.Unauthorized())
    }

    JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            return next(httpErrors.Unauthorized())
        }

        req.payload = payload
        next()
    })
}