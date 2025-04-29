const { Router } = require('express')
const router = Router()
const UserController = require('../../controllers/v1/user.controller')
const { verifyAccessToken } = require('../../middlewares/jwt.middleware')
const { canActivate, canUpdate, canDelete } = require('../../middlewares/authorization.middleware')
const { modules } = require('../../utils/permission.utils')

router.get('/', verifyAccessToken, canActivate(modules.user), UserController.index)
router.get('/:id', verifyAccessToken, canActivate(modules.user), UserController.show)
router.put('/:id', verifyAccessToken, canUpdate(modules.user), UserController.update)
router.delete('/:id', verifyAccessToken, canDelete(modules.user), UserController.destroy)

module.exports = router