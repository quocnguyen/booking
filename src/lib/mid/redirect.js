'use strict'

function config (app) {
  app.use(redirect)
  return app
}

function redirect (req, res, next) {
  res.redirect = function (link, statusCode) {
    res.statusCode = Number(statusCode) || 303
    res.setHeader('Location', link)
    res.end()
  }

  next()
}

module.exports = config
