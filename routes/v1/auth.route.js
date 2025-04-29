const { Router } = require('express')
const router = Router()
const AuthController = require('../../controllers/v1/auth.controller')
const { verifyAccessToken } = require('../../middlewares/jwt.middleware')

router.post('/login', AuthController.login)
router.post('/register', verifyAccessToken, AuthController.register)
router.delete('/logout', verifyAccessToken, AuthController.logout)

module.exports = router