const httpErrors = require('http-errors')
const User = require('./../../models/user.model')
const { LoginRequest, RegisterRequest } = require('./../../requests/v1/auth.request')
const { signAccessToken } = require('./../../helpers/jwt.helper')

const validateUser = async ({ email, password }) => {
    const user = await User.findOne({ email })
    if (!user) {
        return httpErrors.Unauthorized('Incorrect email or password')
    }

    const isValid = await user.isValidPassword(password)
    if (!isValid) {
        return httpErrors.Unauthorized('Incorrect email or password')
    }
}

module.exports = {
    login: async (req, res, next) => {
        try {
            const payload = { email } = await LoginRequest.validateAsync(req.body)
            const error = await validateUser(payload)
            if (error) {
                throw error
            }

            const [ user ] = await User.aggregate([
                {
                    $match: { email }
                },
                {
                    $lookup: {
                        from: "roles",
                        localField: "role_id",
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    permissions: 1
                                }
                            }
                        ],
                        foreignField: "_id",
                        as: "role"
                    }
                },
                {
                    $unwind: {
                        path: "$role",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        name: {
                            $concat: ["$first_name", " ", "$last_name"]
                        }
                    }
                },
                {
                    $project: {
                        name: 1,
                        role: 1,
                    }
                }
            ])

            const { _id: user_id } = user
            const accessToken = await signAccessToken(user_id)
            const cookieOptions = { 
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            }

            res.cookie('accessToken', accessToken, cookieOptions)
               .cookie('user', user, cookieOptions)
               .status(200)
               .json({ success: true, message: 'Login successfully' })
        }
        catch (error) {
            if (error.isJoi) {
                return next(httpErrors.BadRequest('Invalid email or password'))
            }

            next(error)
        }
    },
    register: async (req, res, next) => {
        try {
            const payload = await RegisterRequest.validateAsync(req.body)  
            const { email } = payload          
            const doesExist = await User.findOne({ email })

            if (doesExist) {
                throw httpErrors.Conflict(`Email ${email} has already been registered`)
            }
            else {
                const user = await new User({ ...payload, is_active: true }).save()
                res.send({ data: user })
            }
        }
        catch (error) {
            if (error.isJoi) {
                error.status = 422
            }

            next(error)
        }
    },
    logout: async (req, res, next) => {

        res.clearCookie('accessToken')
           .clearCookie('user')
           .status(200)
           .json({ message: 'Logged out successfully' });
    }
}