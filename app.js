const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const httpErrors = require('http-errors')
const cookieParser = require("cookie-parser")
const app = express()

require('dotenv').config()
require('./helpers/init.mongodb')
require('./helpers/init.data')

app.disable('x-powered-by')
app.set('query parser', 'simple')
app.set('view engine', 'ejs')

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(cookieParser())

const v1 = require('./routes/v1/index.route')
app.use('/api/v1', v1)

app.use(async (req, res, next) => {
    next(httpErrors.NotFound())
})

app.use(async (err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`))