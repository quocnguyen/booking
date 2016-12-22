'use strict'

function config (app) {
  app.use(local)
  return app
}

function local (req, res, next) {
  res.locals = res.locals || {}
  next()
}
module.exports = config
