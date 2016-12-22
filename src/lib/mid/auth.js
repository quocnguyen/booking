'use strict'

const co = require('co')
const model = require('../model')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

function config (app) {
  passport.use(new LocalStrategy(
    {usernameField: 'username', passwordField: 'password'},
    (username, password, next) => {
      co(function * () {
        username = username.trim()
        password = password.trim()
        let user = yield model.userdb.login(username, password)
        next(null, user)
      })
      .catch(next)
    }
  ))

  passport.serializeUser((user, cb) => {
    cb(null, user.id)
  })

  passport.deserializeUser((id, cb) => {
    model.userdb.findOne(id)
      .then(user => cb(null, user))
      .catch(cb)
  })

  app.use(passport.initialize())
  app.use(passport.session())

  return app
}

module.exports = config
