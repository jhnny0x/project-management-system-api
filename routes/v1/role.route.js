const { Router } = require('express')
const router = Router()
const RoleController = require('../../controllers/v1/role.controller')
const { verifyAccessToken } = require('../../middlewares/jwt.middleware')
const { canActivate, canCreate, canUpdate, canDelete } = require('../../middlewares/authorization.middleware')
const { modules } = require('../../utils/permission.utils')

router.get('/', verifyAccessToken, canActivate(modules.role), RoleController.index)
router.get('/:id', verifyAccessToken, canActivate(modules.role), RoleController.show)
router.post('/', verifyAccessToken, canCreate(modules.role), RoleController.store)
router.put('/:id', verifyAccessToken, canUpdate(modules.role), RoleController.update)
router.delete('/:id', verifyAccessToken, canDelete(modules.role), RoleController.destroy)

module.exports = router