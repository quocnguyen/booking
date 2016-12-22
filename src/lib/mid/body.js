'use strict'

const bodyParser = require('body-parser')

function config (app) {
  app.use(bodyParser.urlencoded({
    extended: false,
    limit: '5mb'
  }))
  app.use(bodyParser.json({
    limit: '5mb'
  }))

  return app
}

module.exports = config
