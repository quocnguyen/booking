'use strict'

const crypto = require('crypto')
const BetterError = require('../BetterError')
const model = require('../model')
const co = require('co')
const cuid = require('cuid')
const groups = require('../json/group.json')
const selected = require('../helpers/selected')
const moment = require('moment')
moment.locale('vi')
require('twix')

exports.list = list
exports.listBookableResources = listBookableResources
exports.create = create
exports.handleCreate = handleCreate
exports.edit = edit
exports.handleEdit = handleEdit
exports.handleDelete = handleDelete
exports.listSlots = listSlots
exports.report = report

// display all resources
function list (req, res, next) {
  co(function * () {
    return yield model.resourcedb.find()
  })
  .then(function (resources) {
    res.setLayout('backend.html')
      .render('resources/list.html', {
        resources: resources,
      })
  })
  .catch(next)
}

function listBookableResources (req, res, next) {
  co(function * () {
    return yield model.resourcedb.find()
  })
  .then(function (resources) {
    res.setLayout('frontend.html')
      .render('resources/list-bookable.html', {
        resources: resources
      })
  })
  .catch(next)
}

function create (req, res, next) {
  res
    .setLayout('backend.html')
    .render('resources/new.html', {
      groups: groups
    })
}

function handleCreate (req, res, next) {
  const body = req.body
  co(function * () {
    if (!body.name) {
      throw new BetterError(400, 'Tên thiết bị không thể để trống')
    }
    if (!body.group) {
      throw new BetterError(400, 'Tổ quản lý không thể để trống')
    }

    yield model.resourcedb.create(body)
    res.locals.success = 'success'
  })
  .then(next)
  .catch(err => {
    res.locals.err = err
    next()
  })
}

function edit (req, res, next) {
  res
    .setLayout('backend.html')
    .render('resources/edit.html', {
      groups: groups,
      isSelected: selected(req.resource.group, 'id'),
      resource: req.resource
    })
}

function handleEdit (req, res, next) {
  co(function * () {
    let body = req.body
    if (!body.name) {
      throw new BetterError(400, 'Tên thiết bị không thể để trống')
    }
    if (!body.group) {
      throw new BetterError(400, 'Tổ quản lý không thể để trống')
    }

    let resource = req.resource
    yield model.resourcedb.update(resource.id, Object.assign(resource, body))
    res.locals.success = 'success'
  })
  .then(next)
  .catch(err => {
    res.locals.err = err
    next()
  })
}

function handleDelete (req, res, next) {
  co(function * () {
    yield model.resourcedb.delete(req.resource.id)
    res.end()
  })
  .catch(next)
}

function listSlots (req, res, next) {
  co(function * () {
    let bookings = yield model.bookingdb.find()
    let booked = bookings.map(booking => booking.hash)

    let today = moment()
    let until = moment().add('5', 'days')
    let range = moment.twix(today, until).toArray('days')
    let slots = range.map(date => {
      return {
        name: date.format('dddd'),
        startDate: date.format('LL'),
        slots: generatedSlots(date).map(slot => {
          let uniqueStr = slot.startDate + req.resource.id
          let hash = crypto.createHash('md5').update(uniqueStr).digest('hex')

          if (booked.indexOf(hash) > -1) {
            slot.isFree = false
          }
          return slot
        })
      }
    })

    res
      .setLayout('frontend.html')
      .render('resources/list-slot.html', {
        resource: req.resource,
        classroom: req.classroom,
        days: slots
      })
  })
  .catch(next)
}

function generatedSlots (date) {
  return [1, 2, 3, 4, 5].map(hour => {
    let id = cuid()
    let startDate = moment(date).add(hour, 'hour').toISOString()
    let slot = {
      id: id,
      name: `Tiết ${hour}`,
      isFree: true,
      startDate: startDate
    }

    let hash = Buffer(JSON.stringify(slot)).toString('base64')
    slot.hash = hash
    return slot
  })
}

function report (req, res, next) {
  co(function * () {
    let resources = yield model.resourcedb.find()
    let bookings = yield model.bookingdb.find()
    let resourceMap = bookings
      .map(booking => booking.resource.id)
      .reduce((acc, cur) => {
        acc[cur] ? acc[cur]++ : acc[cur] = 1
        return acc
      }, {})

    resources = resources.map(resource => {
      resource.bookingCount = resourceMap[resource.id] || 0
      return resource
    })
    res
      .setLayout('backend.html')
      .render('resources/report.html', {
        resources: resources
      })
  })
  .catch(next)
}
