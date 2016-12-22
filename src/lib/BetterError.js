'use strict'

// like Error but with status code
function BetterError (code, message) {
  this.code = code
  this.name = code || 400
  this.message = message || 'BetterError'
  this.stack = (new Error()).stack
}

BetterError.prototype = Object.create(Error.prototype)
BetterError.prototype.constructor = BetterError

module.exports = BetterError
