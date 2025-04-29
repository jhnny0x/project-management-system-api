const httpErrors = require('http-errors')
const Task = require('./../../models/task.model')
const { filterParams, sortParams, includeParams } = require('../../helpers/queries.helper')
const { TaskRequest } = require('./../../requests/v1/task.request')
const { convertToObjectId } = require('./../../helpers/helpers')

const includeLookups = queries => {
    const lookups = []
    const include_params = includeParams(queries)

    for (let param of include_params) {
        if (param == 'include_project') {
            lookups.push(
                {
                    $lookup: {
                        from: "projects",
                        localField: "project_id",
                        foreignField: "_id",
                        pipeline: [
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
                            },
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
                                $project: {
                                    created_by: 0,
                                    client_id: 0,
                                    __v: 0
                                }
                            }
                        ],
                        as: "project"
                    }
                },
                {
                    $unwind: {
                        path: "$project",
                        preserveNullAndEmptyArrays: true
                    }
                }
            )
        }

        if (param == 'include_assignee') {
            lookups.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "assigned_to",
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
                        as: "assignee"
                    }
                },
                {
                    $unwind: {
                        path: "$assignee",
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
                        as: "creator"
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

        if (param == 'include_checker') {
            lookups.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "checked_by",
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
                        as: "checker"
                    }
                },
                {
                    $unwind: {
                        path: "$checker",
                        preserveNullAndEmptyArrays: true
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
            const tasks = await Task.aggregate([
                {
                    $match: {
                        ...filters
                    }
                },
                {
                    $group: {
                        _id: "$status.name",
                        tasks: {
                            $push: "$$ROOT"
                        },
                        number_of_tasks: {
                            $sum: 1
                        }
                    }
                },
                {
                    $lookup: {
                        from: "statuses",
                        localField: "status_id",
                        foreignField: "_id",
                        as: "status"
                    }
                },
                {
                    $unwind: {
                        path: "$status",
                        preserveNullAndEmptyArrays: false
                    } 
                },
                {
                    $unionWith: {
                        coll: "statuses",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "tasks",
                                    localField: "_id",
                                    foreignField: "status_id",
                                    pipeline: [ 
                                        ...lookups,
                                        {
                                            $project: {
                                                project_id: 0,
                                                created_by: 0,
                                                checked_by: 0,
                                                assigned_to: 0,
                                                status_id: 0,
                                                __v: 0
                                            }
                                        },
                                        {
                                            $sort: {
                                                deadline: -1,
                                                name: 1
                                            }
                                        }
                                    ],
                                    as: "tasks"
                                }
                            }
                        ]
                    }
                },
                {
                    $sort: {
                        order_number: 1,
                        ...sorting
                    }
                },
                {
                    $project: {
                        name: 1,
                        tasks: 1
                    }
                }
            ])

            res.status(200).json({
                success: true,
                data: tasks
            })
        }
        catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const lookups = includeLookups(req.query) 
            const [ task ] = await Task.aggregate([
                {
                    $match: {
                        _id: convertToObjectId(req.params.id)
                    }
                },
                ...lookups,
                {
                    $project: {
                        __v: 0
                    }
                },
            ])

            res.status(200).json({ 
                success: true, 
                data: { task } 
            })
        }
        catch (error) {
            next(error)
        }
    },
    store: async (req, res, next) => {
        try {
            const payload = await TaskRequest.validateAsync(req.body)
            const { aud: created_by } = req.payload
            await Task.insertOne({ ...payload, created_by })
            
            res.status(200).json({ 
                success: true, 
                message: 'The task has been created successfully' 
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
            const payload = await TaskRequest.validateAsync(req.body)
            await Task.updateOne({ _id: req.params.id }, { $set: payload })

            res.send({ success: true, message: 'The task has been updated successfully' })
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
            await Task.deleteOne({ _id: req.params.id })
            res.send({ success: true, message: 'The task has been deleted successfully' })
        }
        catch (error) {
            next(error)
        }
    }
}