const { Router } = require('express')
const router = Router()
const TaskController = require('../../controllers/v1/task.controller')
const { verifyAccessToken } = require('../../middlewares/jwt.middleware')
const { canActivate, canCreate, canUpdate, canDelete } = require('../../middlewares/authorization.middleware')
const { modules } = require('../../utils/permission.utils')

router.get('/', verifyAccessToken, canActivate(modules.task), TaskController.index)
router.get('/:id', verifyAccessToken, canActivate(modules.task), TaskController.show)
router.post('/', verifyAccessToken, canCreate(modules.task), TaskController.store)
router.put('/:id', verifyAccessToken, canUpdate(modules.task), TaskController.update)
router.delete('/:id', verifyAccessToken, canDelete(modules.task), TaskController.destroy)

module.exports = router