'use strict'
const session = require('express-session')
const LevelStore = require('level-session-store')(session)
const model = require('../model')

function config (app) {
  app.use(session({
    name: 'focus.sid',
    genid: function () {
      return Math.random().toString(16).substr(2)
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    proxy: true,
    store: new LevelStore(model.db)
  }))

  return app
}

module.exports = config
