const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME
})

mongoose.connection.on('connected', () => {
    console.log('Database connected')
})

mongoose.connection.on('error', err => {
    console.log(err.message)
})

mongoose.connection.on('disconnected', () => {
    console.log('Database disconnected')
})

process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
})