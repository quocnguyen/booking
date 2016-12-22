'use strict'

const compression = require('compression')

function config (app) {
  app.use(compression({
    level: process.env.COMPRESSION_LEVEL || 1
  }))
  return app
}

module.exports = config
