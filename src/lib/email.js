'use strict'

const emailjs = require('emailjs')
const consolidate = require('consolidate')
const path = require('path')
const smtp = emailjs.server.connect(getSMTPOption())

// send email using email object
function send (email) {
  if (process.env.NODE_ENV !== 'production') {
    return Promise.resolve()
  }

  return _send(email)
}

// render email
function render (view, data) {
  let file = path.resolve(__dirname, '..', 'views', 'emails', view)
  return new Promise((resolve, reject) => {
    consolidate.mustache(file, data || {}, (err, html) => {
      if (err) { return reject(err) }
      resolve(html)
    })
  })
}

function getSMTPOption () {
  let opt = {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    ssl: Boolean(Number(process.env.SMTP_SSL)),
    timeout: Number(process.env.SMTP_TIMEOUT)
  }

  let ssl = process.env.SMTP_SSL
  if (isNaN(Number(ssl))) {
    opt.ssl = !!Number(ssl)
  } else {
    opt.ssl = JSON.parse(ssl)
  }

  let tls = process.env.SMTP_TLS
  if (isNaN(Number(tls))) {
    opt.tls = !!Number(tls)
  } else {
    opt.tls = JSON.parse(tls)
  }

  return opt
}

function _send (email) {
  return new Promise((resolve, reject) => {
    smtp.send({
      text: email.body,
      from: email.from || process.env.ADMIN_EMAIL,
      to: email.to,
      subject: email.subject,
      attachment: [{
        data: email.body || '',
        alternative: true
      }]
    }, err => {
      if (err) { return reject(err) }
      resolve(email)
    })
  })
}

module.exports = {
  send: send,
  render: render
}
