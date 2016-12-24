'use strict'

const ctrl = require('../ctrl')
const router = require('router')
const model = require('../model')
const params = require('../mid/params')
const BetterError = require('../BetterError')

const app = params(router())

module.exports = app

const frontLayout = (req, res, next) => {
  res.setLayout('frontend.html', {
    'feedback': 'partials/feedback_front',
    'header': 'partials/frontend_header',
    'footer': 'partials/frontend_footer'
  })
  next()
}

app.use(frontLayout)

app.use((req, res, next) => {
  res.locals.user = req.user
  if (req.user && req.user.role === 'admin') {
    res.locals.isAdmin = true
  }

  if (req.user && req.user.role === 'member') {
    res.locals.isMember = true
  }

  next()
})

app.get('/', ctrl.landingpage.home)
app.get('/resources', ctrl.resource.listBookableResources)
app.get('/resources/:resourceId', ctrl.classroom.listBookableClassroom)
app.get('/resources/:resourceId/classrooms/:classroomId', ctrl.resource.listSlots)
app.get('/resources/:resourceId/classrooms/:classroomId/slots/:slotHash', ctrl.booking.create)

app.get('/create-default-root-admin-582a4c90df12e', ctrl.user.defaultAdmin)
app.get('/login', ctrl.user.login)
app.post('/login', ctrl.user.handleLogin, ctrl.user.login)
app.get('/logout', ctrl.user.logout)

