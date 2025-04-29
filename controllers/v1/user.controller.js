const User = require('./../../models/user.model')
const { filterParams, sortParams, includeParams } = require('../../helpers/queries.helper')
const { convertToObjectId } = require('./../../helpers/helpers')
const { UserRequest } = require('./../../requests/v1/user.request')

const includeLookups = queries => {
    const lookups = []
    const include_params = includeParams(queries)

    for (let param of include_params) {
        if (param == 'include_created_tasks') {
            lookups.push(
                {
                    $lookup: {
                        from: "tasks",
                        localField: "_id",
                        foreignField: "created_by",
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
                                $project: {
                                    project_id: 0,
                                    created_by: 0,
                                    checked_by: 0,
                                    assigned_to: 0,
                                    status_id: 0
                                }
                            },
                            {
                                $sort: {
                                    deadline: -1,
                                    name: 1
                                }
                            }
                        ],
                        as: "created_tasks"
                    }
                },
                {
                    $addFields: {
                        number_of_created_tasks: {
                            $size: "$created_tasks"
                        }
                    }
                }
            )
        }

        if (param == 'include_assigned_tasks') {
            lookups.push(
                {
                    $lookup: {
                        from: "tasks",
                        localField: "_id",
                        foreignField: "assigned_to",
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
                                $project: {
                                    project_id: 0,
                                    created_by: 0,
                                    checked_by: 0,
                                    assigned_to: 0,
                                    status_id: 0
                                }
                            },
                            {
                                $sort: {
                                    deadline: -1,
                                    name: 1
                                }
                            }
                        ],
                        as: "assigned_tasks"
                    }
                },
                {
                    $addFields: {
                        number_of_assigned_tasks: {
                            $size: "$assigned_tasks"
                        }
                    }
                }
            )
        }

        if (param == 'include_tasks_to_check') {
            lookups.push(
                {
                    $lookup: {
                        from: "tasks",
                        localField: "_id",
                        foreignField: "checked_by",
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
                                $project: {
                                    project_id: 0,
                                    created_by: 0,
                                    checked_by: 0,
                                    assigned_to: 0,
                                    status_id: 0
                                }
                            },
                            {
                                $sort: {
                                    deadline: -1,
                                    name: 1
                                }
                            }
                        ],
                        as: "tasks_to_check"
                    }
                },
                {
                    $addFields: {
                        number_of_tasks_to_check: {
                            $size: "$tasks_to_check"
                        }
                    }
                }
            )
        }

        if (param == 'include_created_projects') {
            lookups.push(
                {
                    $lookup: {
                        from: "projects",
                        localField: "_id",
                        foreignField: "created_by",
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
                                $project: {
                                    created_by: 0,
                                    client_id: 0,
                                    __v: 0
                                }
                            }
                        ],
                        as: "created_projects"
                    }
                },
                {
                    $addFields: {
                        number_of_created_projects: {
                            $size: "$created_projects"
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
            
            const users = await User.aggregate([
                {
                    $match: {
                        ...filters
                    }
                },
                ...lookups,
                {
                    $addFields: {
                        name: {
                            $concat: ["$first_name", " ", "$last_name"]
                        }
                    }
                },
                {
                    $sort: {
                        name: 1,
                        ...sorting
                    }
                },
                {
                    $project: {
                        name: 1,
                        created_tasks: 1,
                        number_of_created_tasks: 1,
                        assigned_tasks: 1,
                        number_of_assigned_tasks: 1,
                        tasks_to_check: 1,
                        number_of_tasks_to_check: 1,
                        created_projects: 1,
                        number_of_created_projects: 1,
                    }
                }
            ])

            res.status(200).json({
                success: true,
                data: { users }
            })
        }
        catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const lookups = includeLookups(req.query)
            const user = await User.aggregate([
                {
                    $match: {
                        _id: convertToObjectId(req.params.id)
                    }  
                },
                ...lookups,
                {
                    $addFields: {
                        name: {
                            $concat: ["$first_name", " ", "$last_name"]
                        }
                    }
                },
                {
                    $sort: {
                        name: 1,
                        ...sorting
                    }
                },
                {
                    $project: {
                        name: 1,
                        created_tasks: 1,
                        number_of_created_tasks: 1,
                        assigned_tasks: 1,
                        number_of_assigned_tasks: 1,
                        tasks_to_check: 1,
                        number_of_tasks_to_check: 1,
                        created_projects: 1,
                        number_of_created_projects: 1,
                    }
                }
            ])

            res.status(200).json({ 
                success: true, 
                data: { user } 
            })
        }
        catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const payload = await UserRequest.validateAsync(req.body)
            await User.updateOne({ _id: req.params.id }, { $set: payload })

            res.send({ success: true, message: 'The user has been updated successfully' })
        }
        catch (error) {
            next(error)
        }
    },
    destroy: async (req, res, next) => {
        try {
            await User.deleteOne({ _id: req.params.id })
            res.send({ success: true, message: 'The user has been deleted successfully' })
        }
        catch (error) {
            next(error)
        }
    }
}