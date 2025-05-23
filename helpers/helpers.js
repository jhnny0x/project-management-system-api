const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

module.exports = {
    convertToObjectId: id => ObjectId.createFromHexString(id),
    isValidObjectId: id => ObjectId.isValid(id),
    includeTimestamp: (included = 1) => ({
        created_at: included,
        updated_at: included
    })
}