'use strict'

const path = require('path')
const consolidate = require('consolidate')

function config (app) {
  app.use(layout)
  return app
}

function layout (req, res, next) {
  res.locals = res.locals || {}
  res.layoutConfig = res.layoutConfig || {}

  res.setLayout = function setLayout (name, partials) {
    if (partials) {
      res.layoutConfig[name] = partials
    } else {
      partials = res.layoutConfig[name] || {}
    }

    let view = path.resolve(process.env.ROOT_DIR, 'src', 'views', name)

    function render (file, locals, statusCode) {
      statusCode = statusCode || res.statusCode || 200
      // remove file extension
      file = file.split('.')[0]
      locals = locals || {}
      Object.assign(res.locals, locals, {
        partials: Object.assign(partials, {content: file})
      })

      consolidate.mustache(view, res.locals)
        .then(html => {
          res.statusCode = statusCode
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        })
        .catch(next)
    }

    return {
      render: render
    }
  }
  next()
}

module.exports = config
