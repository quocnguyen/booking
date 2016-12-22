'use strict'

const CRUD = require('./crud')

function Classroom (db) {
  if (!(this instanceof Classroom)) return new Classroom(db)
  let state = {
    db: db.sublevel('classroom'),
    indexdb: db.sublevel('classroom.index'),
    indexFields: []
  }

  CRUD.call(this, state)
}

Classroom.prototype = Object.create(CRUD.prototype)
Classroom.prototype.constructor = Classroom

module.exports = Classroom

