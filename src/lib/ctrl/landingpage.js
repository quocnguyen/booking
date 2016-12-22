'use strict'

exports.home = home

function home (req, res, next) {
  res.setLayout('welcome.html')
    .render('landing/home.html')
}
