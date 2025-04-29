const mongoose = require('mongoose')
const { Schema } = mongoose

const StatusSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        order_number: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

const Status = mongoose.model('statuses', StatusSchema)
module.exports = Status