const Status = require('../models/status.model')
const Role = require('../models/role.model')
const { permissions } = require('./../utils/permission.utils')

const initializeTaskStatus = async () => {
    const data = await Status.find()
    if (!data.length) {
        const statuses = [
            { name: 'Backlog', order_number: 1 },
            { name: 'To Do', order_number: 2 },
            { name: 'In Progress', order_number: 3 },
            { name: 'Developer Testing', order_number: 4 },
            { name: 'QA Testing', order_number: 5 },
            { name: 'Client Feedback', order_number: 6 },
            { name: 'Billing', order_number: 7 },
            { name: 'Done', order_number: 8 },
        ]
    
        await Status.insertMany(statuses)
    }
}

const User = require('../models/user.model')
const createAdmin = async () => {
    const data = await User.find()
    if (!data.length) {
        const admin = {
            first_name: 'Admin',
            last_name: 'Admin',
            email: 'admin@mail.com',
            password: '123456',
            is_active: true
        }

        await User.insertOne(admin)
    }
}

initializeTaskStatus()
createAdmin()