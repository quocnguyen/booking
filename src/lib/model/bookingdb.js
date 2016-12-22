'use strict'

const CRUD = require('./crud')

function Booking (db) {
  if (!(this instanceof Booking)) return new Booking(db)
  let state = {
    db: db.sublevel('booking'),
    indexdb: db.sublevel('booking.index'),
    indexFields: []
  }

  CRUD.call(this, state)
}

Booking.prototype = Object.create(CRUD.prototype)
Booking.prototype.constructor = Booking

module.exports = Booking

