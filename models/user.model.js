const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Schema } = mongoose

const UserSchema = new Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        middle_name: {
            type: String,
        },
        last_name: {
            type: String,
            required: true
        },
        suffix: {
            type: String,
        },
        is_active: {
            type: Boolean,
            required: true,
            default: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            unique: true
        },
        role_id: {
            type: Schema.Types.ObjectId,
            ref: 'roles'
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

UserSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    }
    catch (error) {
        next(error)
    }
})

UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    }
    catch (error) {
        throw error
    }
}

const User = mongoose.model('users', UserSchema)
module.exports = User