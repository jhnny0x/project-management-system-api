const httpErrors = require('http-errors')
const Status = require('./../../models/status.model')
const { filterParams, sortParams, includeParams } = require('../../helpers/queries.helper')
const { convertToObjectId, includeTimestamp } = require('./../../helpers/helpers')

const includeLookups = queries => {
    const lookups = []
    const include_params = includeParams(queries)

    for (let param of include_params) {
        if (param == 'include_tasks') {
            lookups.push(
                {
                    $lookup: {
                        from: "tasks",
                        localField: "_id",
                        foreignField: "status_id",
                        pipeline: [
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
                                                            name: 1,
                                                            is_active: 1
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
                                            $project: {
                                                name: 1,
                                                is_complete: 1,
                                                client: 1
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
                            },
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
                            },
                            {
                                $sort: {
                                    deadline: -1,
                                    name: 1
                                }
                            },
                            {
                                $project: {
                                    status_id: 0,
                                    checked_by: 0,
                                    created_by: 0,
                                    assigned_to: 0,
                                    project_id: 0,
                                    __v: 0
                                }
                            }
                        ],
                        as: "tasks"
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
            const statuses = await Status.aggregate([
                {
                    $match: {
                        ...filters
                    }
                },
                ...lookups,
                {
                    $sort: {
                        order_number: 1
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
                        ...includeTimestamp(0),
                        __v: 0
                    }
                }
            ])

            res.status(200).json({
                success: true,
                data: { statuses }
            })
        }
        catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const lookups = includeLookups(req.query)    
            const [ status ] = await Status.aggregate([
                {
                    $match: {
                        _id: convertToObjectId(req.params.id)
                    }  
                },
                ...lookups,
                {
                    $project: {
                        ...includeTimestamp(0),
                        __v: 0
                    }
                }
            ])

            res.status(200).json({
                success: true,
                data: { status }
            })
        }
        catch (error) {
            next(error)
        }
    }
}