'use strict'

const capitalize = require('./capitalize')

module.exports = function capitalizeUserRole (res) {
  return function (user) {
    let roles = []
    if (user.role === 'member') {
      roles.push('member')
    }

    if (user.role === 'admin') {
      roles.push('member', 'admin')
    }

    roles.forEach(function (role) {
      let roleName = capitalize(role)
      res.locals[`is${roleName}`] = true
    })

    return Promise.resolve()
  }
}
