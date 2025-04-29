const mongoose = require('mongoose')
const { Schema } = mongoose 

const TaskSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        deadline: {
            type: Date
        },
        project_id: {
            type: Schema.Types.ObjectId,
            ref: 'projects'
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        checked_by: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        assigned_to: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        status_id: {
            type: Schema.Types.ObjectId,
            ref: 'statuses'
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

const Task = mongoose.model('tasks', TaskSchema)
module.exports = Task