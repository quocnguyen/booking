'use strict'

const cuid = require('cuid')
const through2 = require('through2')
const crypto = require('crypto')
const co = require('co')
const moment = require('moment')
const util = require('util')
const DATE_FORMAT = process.env.DATE_FORMAT || 'MM-DD-YYYY'

function CRUD (state) {
  if (!(this instanceof CRUD)) return new CRUD(state)
  state = Object.assign({
    db: null,
    indexdb: null,
    indexFields: [],
    ref: {},
    validate: {}
  }, state)
  this.db = state.db
  this.indexdb = state.indexdb
  this.indexFields = state.indexFields
}

CRUD.prototype.findId = function findId (key) {
  let self = this
  return new Promise((resolve, reject) => {
    self.indexdb.get(key, (err, id) => {
      if (err && err.name === 'NotFoundError') {
        return resolve(null, null)
      }
      if (err) { return reject(err) }

      resolve(id)
    })
  })
}

CRUD.prototype.findOne = function findOne (id) {
  let self = this
  return new Promise((resolve, reject) => {
    self.db.get(id, (err, value) => {
      if (err && err.name === 'NotFoundError') {
        return resolve(null, null)
      }
      if (err) { return reject(err) }

      if (value.status && value.status === 'delete') {
        return resolve(null, null)
      }

      resolve(value)
    })
  })
}

CRUD.prototype.create = function (obj) {
  obj.id = obj.id || cuid()
  if (!obj.created || moment(obj.created, DATE_FORMAT).isValid() === false) {
    obj.created = Date.now()
  }

  let ops = []
  let self = this
  return new Promise((resolve, reject) => {
    ops.push({type: 'put', key: obj.id, value: obj})

    self.indexFields.forEach((field) => {
      ops.push({type: 'put', key: obj[field], value: obj.id, prefix: self.indexdb})
    })

    self.db.batch(ops, (err) => {
      if (err) return reject(err)
      resolve(obj)
    })
  })
}

CRUD.prototype.update = function (id, newObj, oldObj) {
  let self = this
  newObj.updated = Date.now()
  let ops = []
  return new Promise((resolve, reject) => {
    ops.push({ type: 'put', key: newObj.id, value: newObj })

    self.indexFields.forEach(field => {
      if (oldObj && oldObj[field]) {
        ops.push({ type: 'del', key: oldObj[field], prefix: self.indexdb })
      }

      if (newObj[field]) {
        ops.push({ type: 'put', key: newObj[field], value: newObj.id, prefix: self.indexdb })
      }
    })
    self.db.batch(ops, (err) => {
      if (err) return reject(err)
      resolve(newObj)
    })
  })
}

CRUD.prototype.delete = function (ids) {
  let self = this
  return co(function * () {
    ids = ids || []
    if (util.isString(ids)) ids = [ids]
    let list = yield self.findByIDs(ids)
    let ops = []
    // add status = delete
    list.map(i => {
      i.status = 'delete'
      return i
    })

    // save
    list.forEach(i => ops.push({type: 'put', key: i.id, value: i}))
    return ops
  }).then(ops => {
    return new Promise((resolve, reject) => {
      self.db.batch(ops, (err) => {
        if (err) { return reject(err) }
        resolve()
      })
    })
  })
}

CRUD.prototype.findByIDs = function findByIDs (ids) {
  let self = this
  ids = ids || []
  let task = []
  ids.forEach(id => task.push(self.findOne(id)))

  return Promise
    .all(task)
    .then(arr => arr.reduce((a, b) => {
      if (b !== null) a.push(b)
      return a
    }, []))
}

CRUD.prototype.find = function find (sub) {
  let self = this
  let db = sub ? self.db.sublevel(sub) : self.db
  return new Promise((resolve) => {
    let result = []
    let filter = filterfactory()
    let s = db.createReadStream({keys: false}).pipe(filter)
    s.on('data', data => result.push(data))
    s.on('end', () => resolve(result))
  })
}

CRUD.prototype.findBy = function findBy (value, type) {
  return new Promise((resolve) => {
    let result = []
    let filter = filterfactory(value, type)
    let s = this.db.createReadStream({keys: false}).pipe(filter)
    s.on('data', data => result.push(data))
    s.on('end', () => resolve(result))
  })
}

CRUD.prototype.createFindByStream = function createFindByStream (value, type) {
  let filter = filterfactory(value, type)
  return this.db.createReadStream({keys: false}).pipe(filter)
}

CRUD.prototype.createId = function createId () {
  let args = Array.prototype.slice.call(arguments)
  let str = args.join(':')
  let hmac = crypto.createHmac('sha256', process.env.SECRET || 'denthecat')
  hmac.update(str)
  return hmac.digest('hex')
}

CRUD.prototype.filterByDateRange = function filterByDateRange (fromDate, toDate) {
  return through2.obj(function (record, enc, cb) {
    let created
    if (util.isNumber(record.created)) {
      created = moment(Number(record.created))
    } else {
      created = moment(record.created, DATE_FORMAT)
    }
    if (created.isBetween(fromDate, toDate)) return cb(null, record)
    cb()
  })
}

function filterfactory (value, type) {
  value = value || null
  type = type || null
  return through2({objectMode: true}, function (obj, enc, cb) {
    if (obj.status && obj.status === 'delete') {
      return cb(null, null)
    }

    // empty filter, pass through
    if (value === null && type === null) {
      return cb(null, obj)
    }

    // filter by type and value
    if (obj[type] === value) this.push(obj)
    cb()
  })
}

module.exports = CRUD
