const { Router } = require('express')
const router = Router()
const StatusController = require('../../controllers/v1/status.controller')
const { verifyAccessToken } = require('../../middlewares/jwt.middleware')
const { canActivate } = require('../../middlewares/authorization.middleware')
const { modules } = require('../../utils/permission.utils')

router.get('/', verifyAccessToken, canActivate(modules.status), StatusController.index)
router.get('/:id', verifyAccessToken, canActivate(modules.status), StatusController.show)

module.exports = router