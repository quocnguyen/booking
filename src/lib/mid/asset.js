'use strict'

const path = require('path')
const serveStatic = require('serve-static')

function config (app) {
  let dir = path.resolve(__dirname, '..', '..', 'public')
  let opt = {}

  if (process.env.NODE_ENV === 'production') {
    opt.maxAge = 60 * 60 * 1000
  }
  app.use(serveStatic(dir, opt))
  return app
}

module.exports = config
