const { Router } = require('express')
const router = Router()
const ClientController = require('../../controllers/v1/client.controller')
const { verifyAccessToken } = require('../../middlewares/jwt.middleware')
const { canActivate, canCreate, canUpdate, canDelete } = require('../../middlewares/authorization.middleware')
const { modules } = require('../../utils/permission.utils')

router.get('/', verifyAccessToken, canActivate(modules.client), ClientController.index)
router.get('/:id', verifyAccessToken, canActivate(modules.client), ClientController.show)
router.post('/', verifyAccessToken, canCreate(modules.client), ClientController.store)
router.put('/:id', verifyAccessToken, canUpdate(modules.client), ClientController.update)
router.delete('/:id', verifyAccessToken, canDelete(modules.client), ClientController.destroy)

module.exports = router