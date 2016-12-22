'use strict'

const CRUD = require('./crud')

function Resource (db) {
  if (!(this instanceof Resource)) return new Resource(db)
  let state = {
    db: db.sublevel('resource'),
    indexdb: db.sublevel('resource.index'),
    indexFields: []
  }

  CRUD.call(this, state)
}

Resource.prototype = Object.create(CRUD.prototype)
Resource.prototype.constructor = Resource

module.exports = Resource
