'use strict'

const model = require('../model')
const BetterError = require('../BetterError')

module.exports = (app) => {
  app.param('resourceId', (req, res, next, id) =>
    model.resourcedb
      .findOne(id)
      .then(item => {
        if (item === null) return next(new BetterError(404))
        req.resource = item
        next()
      })
      .catch(next)
  )

  app.param('classroomId', (req, res, next, id) =>
    model.classroomdb
      .findOne(id)
      .then(item => {
        if (item === null) return next(new BetterError(404))
        req.classroom = item
        next()
      })
      .catch(next)
  )

  app.param('userId', (req, res, next, id) =>
    model.userdb
      .findOne(id)
      .then(item => {
        if (item === null) return next(new BetterError(404))
        req.current = item
        next()
      })
      .catch(next)
  )

  app.param('bookingId', (req, res, next, id) =>
    model.bookingdb
      .findOne(id)
      .then(item => {
        if (item === null) return next(new BetterError(404))
        req.booking = item
        next()
      })
      .catch(next)
  )

  return app
}
