'use strict'

const router = require('router')
const ctrl = require('../ctrl')
const params = require('../mid/params')
const app = params(router())

module.exports = app

const adminLayout = (req, res, next) => {
  res.setLayout('backend.html', {
    'feedback': 'partials/admin_feedback',
    'header': 'partials/admin_header',
    'footer': 'partials/admin_footer'
  })

  next()
}

app.use(adminLayout)

app.get('/', ctrl.dashboard.index)
app.get('/resources', ctrl.resource.list)
app.get('/resources/new', ctrl.resource.create)
app.post('/resources/new',
  ctrl.resource.handleCreate,
  ctrl.resource.create
)
app.get('/resources/edit/:resourceId', ctrl.resource.edit)
app.post('/resources/edit/:resourceId',
  ctrl.resource.handleEdit,
  ctrl.resource.edit
)
app.get('/resources/del/:resourceId',
  ctrl.resource.handleDelete,
  ctrl.resource.list
)

app.get('/classrooms', ctrl.classroom.list)
app.get('/classrooms/new', ctrl.classroom.create)
app.post('/classrooms/new',
  ctrl.classroom.handleCreate,
  ctrl.classroom.create
)
app.get('/classrooms/edit/:classroomId', ctrl.classroom.edit)
app.post('/classrooms/edit/:classroomId',
  ctrl.classroom.handleEdit,
  ctrl.classroom.edit
)
app.get('/classrooms/del/:classroomId',
  ctrl.classroom.handleDelete,
  ctrl.classroom.list
)

app.get('/users', ctrl.user.list)
app.get('/users/new', ctrl.user.create)
app.post('/users/new',
  ctrl.user.handleCreate,
  ctrl.user.create
)
app.get('/users/edit/:userId', ctrl.user.edit)
app.post('/users/edit/:userId',
  ctrl.user.handleEdit,
  ctrl.user.edit
)

app.get('/users/del/:userId',
  ctrl.user.handleDelete,
  ctrl.user.list
)

app.get('/bookings', ctrl.booking.list)
app.get('/bookings/del/:bookingId', ctrl.booking.handleDelete)

app.get('/reports', ctrl.resource.report)
