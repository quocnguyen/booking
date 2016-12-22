'use strict'

const url = require('url')
const qs = require('querystring')

function query (req, res, next) {
  req.query = {}
  var parse = url.parse(req.url)
  req.query = qs.parse(parse.query)
  next()
}

function config (app) {
  app.use(query)
  return app
}

module.exports = config
