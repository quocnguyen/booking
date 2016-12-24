'use strict'

const crypto = require('crypto')
const co = require('co')
const model = require('../model')
const BetterError = require('../BetterError')
const smtp = require('../email')
const moment = require('moment')
moment.locale('vi')

exports.list = list
exports.create = create
exports.handleDelete = handleDelete

function list (req, res, next) {
  co(function * () {
    let bookings = yield model.bookingdb.find()
    res
      .setLayout('backend.html')
      .render('bookings/list.html', {
        bookings: bookings,
        formatDate: function () {
          return function (text, render) {
            let date = render(text).trim()
            return moment(date).format('LLLL')
          }
        }
      })
  })
  .catch(next)
}

function create (req, res, next) {
  co(function * () {
    let slot = {}
    try {
      slot = JSON.parse(Buffer(req.params.slotHash, 'base64').toString('utf-8'))
    } catch (err) {
      throw new BetterError(500)
    }

    if (!slot.startDate) {
      throw new BetterError(500)
    }

    let uniqueStr = slot.startDate + req.resource.id
    let hash = crypto.createHash('md5').update(uniqueStr).digest('hex')

    let bookingId = yield model.bookingdb.findId(hash)
    if (bookingId) {
      throw new BetterError(400, 'Thời gian này đã có người mượn')
    }

    let booking = yield model.bookingdb.create({
      user: req.user,
      resource: req.resource,
      classroom: req.classroom,
      slot: slot,
      hash: hash
    })

    let startDate = moment(slot.startDate).format('LLLL')
    if (req.user.email) {
      yield smtp.send({
        from: 'no-reply@quanlithietbigiaoduc.com',
        body: `Chúc mừng bạn đã mượn thành công thiết bị ${req.resource.name} vào lúc ${startDate}, Bạn vui lòng đến tại phòng thiết bị để nhận thiết bị sớm hơn 15p trước tiết dạy`,
        to: req.user.email,
        subject: 'Mượn thiết bị thành công'
      })
    }

    res
      .setLayout('frontend.html')
      .render('bookings/success.html', {
        booking: booking
      })
  })
  .catch(next)
}

function handleDelete (req, res, next) {
  co(function * () {
    yield model.bookingdb.delete(req.booking.id)
    res.end()
  })
  .catch(next)
}
