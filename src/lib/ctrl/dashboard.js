'use strict'

exports.index = index

function index (req, res, next) {
  res.setLayout('backend.html').render('dashboard/index.html')
}
