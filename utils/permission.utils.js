const permission = {
    can_activate: 1,
    can_create: 1,
    can_update: 1,
    can_delete: 1
}

module.exports = {
    modules: {
        user: 'User Manager',
        project: 'Project Manager',
        client: 'Client Manager',
        task: 'Task Manager',
        role: 'Role Manager',
        profile: 'Profile Manager',
        status: 'Status Manager'
    },
    permissions: [
        { module_name: 'User Manager', permission },
        { module_name: 'Project Manager', permission },
        { module_name: 'Client Manager', permission },
        { module_name: 'Task Manager', permission },
        { module_name: 'Role Manager', permission },
        { module_name: 'Profile Manager', permission },
        { module_name: 'Status Manager', permission },
    ]
}