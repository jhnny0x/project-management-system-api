const { convertToObjectId, isValidObjectId } = require('./helpers')

const sanitizeData = value => {
    if (value == "true" || value == "false") {
        value = value == "true"
    }

    if (isValidObjectId(value)) {
        value = convertToObjectId(value)
    }

    return value
}

module.exports = {
    filterParams: queries => {
        const filters = {}
        const validOperators = ['gt', 'gte', 'lt' ,'lte', 'eq', 'ne', 'in', 'nin']
        const regex = new RegExp("^(include_[a-z_]*)$")
    
        for (let [param, value] of Object.entries(queries)) {
            if (param == 'order_by' || regex.test(param)) {
                continue
            }

            const position = param.lastIndexOf('-')
            value = sanitizeData(value)
    
            if (position == -1) {
                filters[param] = value
            }
            else {
                const comparison = param.substring(position + 1)
                param = param.substring(0, position)
                if (validOperators.includes(comparison)) {
                    filters[param] = {}
                    filters[param][`$${comparison}`] = value
                }   
            }
        }
    
        return filters
    },
    sortParams: ({ order_by }) => {
        const sort = {}
        if (order_by) {
            const sortDirections = ['asc', 'desc']
            if (Object.prototype.toString.apply(order_by) == '[object String]') {
                const [ field, direction ] = order_by.split('-')
                if (direction && sortDirections.includes(direction)) {
                    sort[field] = direction == 'asc' ? 1 : -1
                }
                else {
                    sort[field] = 1
                }
            }
            else {
                for (let order of order_by) {
                    const [ field, direction ] = order.split('-')
                    if (direction && sortDirections.includes(direction)) {
                        sort[field] = direction == 'asc' ? 1 : -1
                    }
                    else {
                        sort[field] = 1
                    }
                }
            }
        }
    
        return sort
    },
    includeParams: queries => {
        const regex = new RegExp("^(include_[a-z_]*)$")
        return Object.keys(queries).filter(query => regex.test(query))
    }
}