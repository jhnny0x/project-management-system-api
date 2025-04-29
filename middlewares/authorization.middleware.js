const httpErrors = require('http-errors')

module.exports = {
    canActivate: module_name => async (req, res, next) => {
        const { role } = req.cookies.user
        const { permission } = role.permissions.find(permission => permission.module_name == module_name)
        if (!permission.can_activate) {
            return next(httpErrors.Unauthorized())
        }

        next()
    },
    canCreate: module_name => async (req, res, next) => {
        const { role } = req.cookies.user
        const { permission } = role.permissions.find(permission => permission.module_name == module_name)
        if (!permission.can_create) {
            return next(httpErrors.Unauthorized())
        }

        next()
    },
    canUpdate: module_name => async (req, res, next) => {
        const { role } = req.cookies.user
        const { permission } = role.permissions.find(permission => permission.module_name == module_name)
        if (!permission.can_update) {
            return next(httpErrors.Unauthorized())
        }

        next()
    },
    canDelete: module_name => async (req, res, next) => {
        const { role } = req.cookies.user
        const { permission } = role.permissions.find(permission => permission.module_name == module_name)
        if (!permission.can_delete) {
            return next(httpErrors.Unauthorized())
        }

        next()
    },
}