
'use strict'

const CRUD = require('./crud')
const pwd = require('pwd')
const cuid = require('cuid')
const BetterError = require('../BetterError')
const co = require('co')

function User (db) {
  if (!(this instanceof User)) return new User(db)
  let state = {
    db: db.sublevel('users'),
    indexdb: db.sublevel('users.index'),
    indexFields: ['email', 'phone', 'username']
  }

  CRUD.call(this, state)
}

User.prototype = Object.create(CRUD.prototype)
User.prototype.constructor = User

User.prototype.login = function login (credential, password) {
  var self = this
  return self.findId(credential)
    .then(id => self.findOne(id))
    .then(user => {
      if (user === null) throw new BetterError(400, 'invalid_credential')
      return self.comparePassword(user, password)
    })
}

User.prototype.comparePassword = function comparePassword (user, password) {
  return new Promise((resolve, reject) => {
    if (user === null) {
      return resolve(null, null)
    }

    pwd.hash(password, user.salt, (err, hash) => {
      if (err && err.name === 'NotFoundError') {
        return resolve(null, null)
      }

      if (err) { return reject(err) }

      if (hash !== user.password) {
        return reject(new Error('invalid_password'))
      }

      resolve(user)
    })
  })
}

User.prototype.hash = function hash (password) {
  return new Promise((resolve, reject) => {
    pwd.hash(password, function (err, salt, hash) {
      if (err) { return reject(err) }
      resolve({
        salt: salt,
        password: password
      })
    })
  })
}

User.prototype.create = function (user) {
  let self = this
  user.id = cuid()
  user.created = Date.now()
  let ops = []
  return new Promise((resolve, reject) => {
    pwd.hash(user.password, function (err, salt, hash) {
      if (err) { return reject(err) }
      user.salt = salt
      user.password = hash

      createUser(user)
    })

    function createUser (user) {
      // save user
      ops.push({type: 'put', key: user.id, value: user});

      // save index
      ['email', 'phone', 'username'].forEach(i => {
        if (user[i]) {
          ops.push({type: 'put', key: user[i], value: user.id, prefix: self.indexdb})
        }
      })

      // commit
      self.db.batch(ops, (err) => {
        if (err) { return reject(err) }
        resolve(user)
      })
    }
  })
}

User.prototype.generateRecoveryCode = function (user) {
  var self = this
  var now = Date.now()

  return new Promise((resolve, reject) => {
    // delay next recovery request by 1 minute
    let delay = 60 * 1000
    if (user.recoveryTime && (now - user.recoveryTime) < delay) {
      return reject(new BetterError(429, 'too_much_recovery_requests'))
    }

    user.recoveryCode = Math.random().toString(16).substr(2)
    user.recoveryTime = Date.now()

    let ops = []
    // update user
    ops.push({type: 'put', key: user.id, value: user})
    ops.push({type: 'put', key: user.recoveryCode, value: user.id, prefix: self.indexdb})

    self.db.batch(ops, (err) => {
      if (err) { return reject(err) }
      resolve(user.recoveryCode)
    })
  })
}

User.prototype.delete = function (id) {
  let self = this

  return co(function* () {
    let user = yield self.findOne(id)
    if (user === null) {
      return yield Promise.reject(new BetterError(400, 'NotFoundError'))
    }
    let ops = []
    ops.push({type: 'del', key: user.id});
    ['username', 'phone', 'email'].forEach(i => {
      if (user[i]) ops.push({type: 'del', key: user[i], prefix: self.index})
    })

    return Promise.resolve(ops)
  }).then(ops => {
    return new Promise((resolve, reject) => {
      self.db.batch(ops, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}
module.exports = User
