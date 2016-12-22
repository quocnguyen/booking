'use strict'

const jwt = require('./jwt')
const BetterError = require('./BetterError')
const model = require('./model')
const co = require('co')
const capitalizeUserRole = require('./capitalize-user-role')

module.exports = {
  isAdmin: isAdmin,
  isLogged: isLogged
}

function isLogged (req, res, next) {
  let allowed = ['admin', 'member']

  if (req.user) {
    if (allowed.indexOf(req.user.role) === -1) {
      return next(new BetterError(403, 'forbidden'))
    }
    res.locals = res.locals || {}
    res.locals.user = req.user

    return Promise.resolve(req.user)
      .then(capitalizeUserRole(res))
      .then(next)
  }

  checkToken(req, allowed)
    .then(capitalizeUserRole(res))
    .then(next)
    .catch(next)
}

function isAdmin (req, res, next) {
  let allowed = ['admin']
  if (req.user) {
    if (allowed.indexOf(req.user.role) === -1) {
      return next(new BetterError(403, 'forbidden'))
    }

    return Promise.resolve(req.user)
      .then(capitalizeUserRole(res))
      .then(next)
  }

  checkToken(req, allowed)
    .then(capitalizeUserRole(res))
    .then(next)
    .catch(next)
}

function checkToken (req, allowed) {
  return co(function* () {
    let token = extractToken(req)
    if (token === null) {
      throw new BetterError(403, 'forbidden')
    }
    let user = yield findUserByToken(token)
    if (user === null || allowed.indexOf(user.role) === -1) {
      throw new BetterError(403, 'forbidden')
    }
    req.user = user
    return yield Promise.resolve(user)
  })
}

/**
 * find user by token
 */
function findUserByToken (token) {
  return jwt.decode(token)
    .then(payload => {
      return model.userdb.findOne(payload.id)
    })
}

/**
 * extract token from query, from headers and from post data
 *
 * @param  {Object} req -  reques tobject
 * @api private
 */
function extractToken (req) {
  let token = null
  if (req.query.token) {
    token = req.query.token
    return token
  }

  let author = req.headers.Authorization || req.headers.authorization
  if (author) {
    author = author.split(' ')
    let type = author[0]
    let value = author[1]
    if (!type || type !== 'Bearer' || !value) {
      return null
    }
    token = value

    return token
  }

  if (req.method === 'POST' && req.token) {
    token = req.token
    return token
  }

  return token
}

