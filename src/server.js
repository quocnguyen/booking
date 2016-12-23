'use strict'

const http = require('http')
const finalhandler = require('finalhandler')
const server = http.createServer()
const routes = require('./lib/routes')

server.on('request', function onRequest (req, res) {
  routes(req, res, finalhandler(req, res))
})

routes.use((err, req, res, next) => {
  let code = Number(err.name)

  if (isNaN(code)) { return next(err) }

  if (code === 401 || code === 403) {
    let url = `/login?auth=required&redirect=${req.url}`
    return res.redirect(url)
  }

  // client err
  if (code >= 400 && code < 500) {
    return res.end(err.message)
  }

  if (code >= 500) {
    return res.end('Có lỗi xãy ra, xin hãy thử lại sau')
  }

  next(err)
})

module.exports = server
