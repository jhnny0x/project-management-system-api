const httpErrors = require('http-errors')
const Role = require('./../../models/role.model')
const User = require('./../../models/user.model')
const { filterParams, sortParams, includeParams } = require('../../helpers/queries.helper')
const { convertToObjectId } = require('../../helpers/helpers')
const { CreateRoleRequest, UpdateRoleRequest } = require('./../../requests/v1/role.request')
const { permissions } = require('./../../utils/permission.utils')

const includeLookups = queries => {
    const lookups = []
    const include_params = includeParams(queries)

    for (let param of include_params) {
        if (param == 'include_users') {
            lookups.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "role_id",
                        pipeline: [
                            {
                                $addFields: {
                                    name: {
                                        $concat: ["$first_name", " ", "$last_name"]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: "users"
                    }
                },
                {
                    $addFields: {
                        number_of_users: {
                            $size: "$users"
                        }
                    }
                }
            )
        }
    }

    return lookups
}

module.exports = {
    index: async (req, res, next) => {
        try {
            const queries = req.query
            const filters = filterParams(queries)
            const sorting = sortParams(queries) 
            const lookups = includeLookups(queries) 

            const roles = await Role.aggregate([
                {
                    $match: {
                        ...filters
                    }
                },
                ...lookups,
                {
                    $project: {
                        name: 1,
                        permissions: 1,
                        users: 1,
                        number_of_users: 1
                    }
                },
                {
                    $sort: {
                        name: 1,
                        ...sorting
                    }
                }
            ])

            res.status(200).json({
                success: true,
                data: { roles }
            })
        }
        catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const lookups = includeLookups(req.query)
            const [ role ] = await Role.aggregate([
                {
                    $match: {
                        _id: convertToObjectId(req.params.id)
                    }
                },
                ...lookups,
                {
                    $project: {
                        name: 1,
                        permissions: 1,
                        users: 1,
                        number_of_users: 1
                    }
                },
            ])

            res.status(200).json({
                success: true,
                data: { role }
            })
        }
        catch (error) {
            next(error)
        }
    },
    store: async (req, res, next) => {
        try {
            const payload = await CreateRoleRequest.validateAsync(req.body)
            await Role.insertOne({ ...payload, permissions })

            res.status(200).json({ 
                success: true, 
                message: 'The role has been created successfully' 
            })
        }
        catch (error) {
            if (error.isJoi) {
                return next(httpErrors.BadRequest())
            }

            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const payload = await UpdateRoleRequest.validateAsync(req.body)
            const { name, module_name, permission } = payload
            
            await Role.updateOne(
                {
                    $and: [
                        { _id: req.params.id },
                        { "permissions.module_name": module_name }
                    ]
                },
                {
                    $set: {
                        name, "permissions.$.permission": permission
                    }
                }
            )

            res.status(200).json({ 
                success: true, 
                message: 'The role has been updated successfully' 
            })
        }
        catch (error) {
            if (error.isJoi) {
                return next(httpErrors.BadRequest())
            }

            next(error)
        }
    },
    destroy: async (req, res, next) => {
        try {
            const role_id = req.params.id
            const users = await User.find({ role_id })
            if (users.length) {
                throw httpErrors.Conflict('Role cannot be deleted. Delete its users first.')
            }

            await Role.deleteOne({ _id: role_id })

            res.status(200).json({ 
                success: true, 
                message: 'The role has been deleted successfully' 
            })
        }
        catch (error) {
            next(error)
        }
    },
}