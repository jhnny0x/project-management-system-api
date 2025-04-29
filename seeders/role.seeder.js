const Role = require('./../models/role.model')
const mongoose = require('mongoose')
const { permissions } = require('./../utils/permission.utils')
const { convertToObjectId } = require('./../helpers/helpers')

require('dotenv').config()
require('./../helpers/init.mongodb')

const roles = [
    new Role({ _id: convertToObjectId('680f98d109b42ae53eefd4fa'), name: 'Administrator', permissions }),
    new Role({ _id: convertToObjectId('680f98d109b42ae53eefd4fb'), name: 'Developer', permissions }),
    new Role({ _id: convertToObjectId('680f98d109b42ae53eefd4fc'), name: 'Project Manager', permissions }),
    new Role({ _id: convertToObjectId('680f98d109b42ae53eefd4fd'), name: 'QA Tester', permissions })
]

const seedRoleCollection = async () => {
    await Role.deleteMany()
    roles.map(async role => await role.save())
    disconnect = async () => {
        await mongoose.disconnect()
        console.log('Role seeding done!')
    }

    setTimeout(disconnect, 2500)
}

seedRoleCollection()