const httpErrors = require('http-errors')
const Project = require('./../../models/project.model')
const Task = require('./../../models/task.model')
const { filterParams, sortParams, includeParams } = require('../../helpers/queries.helper')
const { ProjectRequest } = require('./../../requests/v1/project.request')
const { convertToObjectId, includeTimestamp } = require('./../../helpers/helpers')

const includeLookups = queries => {
    const lookups = []
    const include_params = includeParams(queries)

    for (let param of include_params) {
        if (param == 'include_client') {
            lookups.push(
                {
                    $lookup: {
                        from: "clients",
                        localField: "client_id",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: "client"
                    }
                },
                {
                    $unwind: {
                        path: "$client",
                        preserveNullAndEmptyArrays: true
                    }
                }
            )
        }

        if (param == 'include_creator') {
            lookups.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "created_by",
                        foreignField: "_id",
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
                        as: "creator",
                    }
                },
                {
                    $unwind: { 
                        path: "$creator",
                        preserveNullAndEmptyArrays: true
                    }
                }
            )
        }

        if (param == 'include_tasks') {
            lookups.push(
                {
                    $lookup: {
                        from: "tasks",
                        localField: "_id",
                        foreignField: "project_id",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "created_by",
                                    foreignField: "_id",
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
                                    as: "creator"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$creator",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: "statuses",
                                    localField: "status_id",
                                    foreignField: "_id",
                                    pipeline: [
                                        {
                                            $project: {
                                                name: 1
                                            }
                                        }
                                    ],
                                    as: "status"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$status",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    name: 1,
                                    ...includeTimestamp(),
                                    creator: 1,
                                    status: 1
                                }
                            }
                        ],
                        as: "tasks"
                    }
                },
                {
                    $addFields: {
                        number_of_tasks: {
                            $size: "$tasks"
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
            const projects = await Project.aggregate([
                {
                    $match: {
                        ...filters,
                    }
                },
                ...lookups,
                {
                    $project: {
                        "__v": 0
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
                data: { projects }
            })
        }
        catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const lookups = includeLookups(req.query)         
            const [ project ] = await Project.aggregate([
                {
                    $match: {
                        _id: convertToObjectId(req.params.id)
                    }
                },
                ...lookups,
                {
                    $project: {
                        "__v": 0
                    }
                }
            ])

            res.status(200).json({ 
                success: true, 
                data: { project } 
            })
        }
        catch (error) {
            next(error)
        }
    },
    store: async (req, res, next) => {
        try {
            const payload = await ProjectRequest.validateAsync(req.body)
            const { aud: created_by } = req.payload
            await Project.insertOne({ ...payload, is_complete: false, created_by })

            res.status(200).json({ 
                success: true, 
                message: 'The project has been created successfully' 
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
            const payload = await ProjectRequest.validateAsync(req.body)
            await Project.updateOne({ _id: req.params.id }, { $set: payload })

            res.send({ 
                success: true, 
                message: 'The project has been updated successfully' 
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
            const project_id = req.params.id
            await Task.deleteMany({ project_id })
            await Project.deleteOne({ _id: project_id })

            res.send({ 
                success: true, 
                message: 'The project has been deleted successfully' 
            })
        }
        catch (error) {
            next(error)
        }
    }
}