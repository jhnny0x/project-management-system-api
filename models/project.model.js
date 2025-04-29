const mongoose = require('mongoose')
const { Schema } = mongoose

const ProjectSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        is_complete: {
            type: Boolean,
        },
        client_id: {
            type: Schema.Types.ObjectId,
            ref: 'clients'
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

const Project = mongoose.model('projects', ProjectSchema)
module.exports = Project