const mongoose = require('mongoose')
const { Schema } = mongoose

const ClientSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        is_active: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

const Client = mongoose.model('clients', ClientSchema)
module.exports = Client