'use strict'

const co = require('co')
const BetterError = require('../BetterError')
const model = require('../model')

exports.list = list
exports.listBookableClassroom = listBookableClassroom
exports.create = create
exports.handleCreate = handleCreate
exports.edit = edit
exports.handleEdit = handleEdit
exports.handleDelete = handleDelete

function list (req, res, next) {
  co(function * () {
    let classrooms = yield model.classroomdb.find()

    res
      .setLayout('backend.html')
      .render('classrooms/list.html', {
        classrooms: classrooms
      })
  })
  .catch(next)
}

function listBookableClassroom (req, res, next) {
  co(function * () {
    let classrooms = yield model.classroomdb.find()

    res
      .setLayout('frontend.html')
      .render('classrooms/list-bookable.html', {
        resource: req.resource,
        classrooms: classrooms
      })
  })
  .catch(next)
}

function create (req, res, next) {
  res
    .setLayout('backend.html')
    .render('classrooms/new.html', {
    })
}

function handleCreate (req, res, next) {
  co(function * () {
    let body = req.body
    if (!body.name) {
      throw new BetterError(400, 'Tên không được để trống')
    }

    yield model.classroomdb.create(body)
    res.locals.success = 'Đã lưu'
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
    .render('classrooms/edit.html', {
      classroom: req.classroom
    })
}
function handleEdit (req, res, next) {
  co(function * () {
    let body = req.body
    let classroom = req.classroom
    yield model.classroomdb.update(classroom.id, Object.assign(classroom, body))
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
    yield model.classroomdb.delete(req.classroom.id)
    res.end()
  })
  .catch(next)
}
