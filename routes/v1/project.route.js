const { Router } = require('express')
const router = Router()
const ProjectController = require('../../controllers/v1/project.controller')
const { verifyAccessToken } = require('../../middlewares/jwt.middleware')
const { canActivate, canCreate, canUpdate, canDelete } = require('../../middlewares/authorization.middleware')
const { modules } = require('../../utils/permission.utils')

router.get('/', verifyAccessToken, canActivate(modules.project), ProjectController.index)
router.get('/:id', verifyAccessToken, canActivate(modules.project), ProjectController.show)
router.post('/', verifyAccessToken, canCreate(modules.project), ProjectController.store)
router.put('/:id', verifyAccessToken, canUpdate(modules.project), ProjectController.update)
router.delete('/:id', verifyAccessToken, canDelete(modules.project), ProjectController.destroy)

module.exports = router