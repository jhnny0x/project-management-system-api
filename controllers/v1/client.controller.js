const httpErrors = require('http-errors')
const Client = require('./../../models/client.model')
const Project = require('./../../models/project.model')
const Task = require('./../../models/task.model')
const { filterParams, sortParams, includeParams } = require('../../helpers/queries.helper')
const { ClientRequest } = require('./../../requests/v1/client.request')
const { convertToObjectId, includeTimestamp } = require('./../../helpers/helpers')

const includeLookups = queries => {
    const lookups = []
    const include_params = includeParams(queries)

    for (let param of include_params) {
        if (param == 'include_projects') {
            lookups.push(
                {
                    $lookup: {
                        from: "projects",
                        localField: "_id",
                        foreignField: "client_id",
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    is_complete: 1,
                                    ...includeTimestamp()
                                }
                            }
                        ],
                        as: "projects"
                    }
                },
                {
                    $addFields: {
                        number_of_projects: {
                            $size: "$projects"
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
            
            const clients = await Client.aggregate([
                {
                    $match: {
                        ...filters
                    }
                },
                ...lookups,
                {
                    $project: {
                        name: 1,
                        is_active: 1,
                        projects: 1,
                        number_of_projects: 1,
                        ...includeTimestamp(1)
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
                data: { clients }
            })
        }
        catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const lookups = includeLookups(req.query)    
            const [ client ] = await Client.aggregate([
                {
                    $match: {
                        _id: convertToObjectId(req.params.id)
                    }
                },
                ...lookups,
                {
                    $project: {
                        name: 1,
                        is_active: 1,
                        projects: 1,
                        number_of_projects: 1,
                        ...includeTimestamp()
                    }
                },
            ])

            res.status(200).json({ 
                success: true, 
                data: { client } 
            })
        }
        catch (error) {
            next(error)
        }
    },
    store: async (req, res, next) => {
        try {
            const payload = await ClientRequest.validateAsync(req.body)
            await Client.insertOne({ is_active: true, ...payload })

            res.status(200).json({ 
                success: true, 
                message: 'The client has been created successfully' 
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
            const payload = await ClientRequest.validateAsync(req.body)
            await Client.updateOne({ _id: req.params.id }, { $set: payload })

            res.send({ 
                success: true, 
                message: 'The client has been updated successfully' 
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
            const client_id = req.params.id
            const project_ids = (await Project.find({ client_id })).map(project => project._id)

            await Task.deleteMany({
                project_id: {
                    $in: project_ids
                }
            })

            await Project.deleteMany({ client_id })
            await Client.deleteOne({ _id: client_id })

            res.send({ 
                success: true, 
                message: 'The client has been deleted successfully' 
            })
        }
        catch (error) {
            next(error)
        }
    }
}