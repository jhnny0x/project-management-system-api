const { Router } = require('express')
const v1 = Router()

v1.use('/auth', require('./auth.route'))
v1.use('/clients', require('./client.route'))
v1.use('/projects', require('./project.route'))
v1.use('/roles', require('./role.route'))
v1.use('/statuses', require('./status.route'))
v1.use('/tasks', require('./task.route'))
v1.use('/users', require('./user.route'))

module.exports = v1