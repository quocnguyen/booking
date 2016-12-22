'use strict'

const path = require('path')
const cons = require('consolidate')

function config (app) {
  app.use(view)
  return app
}

function view (req, res, next) {
  res.render = render

  function render (file, locals, statusCode) {
    statusCode = statusCode || 200
    let view = path.resolve(__dirname, '..', '..', 'views', file)

    locals = locals || {}
    if (res.locals) {
      locals = Object.assign(res.locals, locals)
    }

    cons.mustache(view, locals)
      .then(html => {
        res.statusCode = res.statusCode || statusCode
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(html)
      })
      .catch(next)
  }

  next()
}

module.exports = config
