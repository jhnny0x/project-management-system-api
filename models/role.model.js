const mongoose = require('mongoose')
const { Schema } = mongoose

const RoleSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        permissions: [
            {
                type: Object,
                required: true
            }
        ]
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

const Role = mongoose.model('roles', RoleSchema)
module.exports = Role