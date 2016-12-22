'use strict'

const jwt = require('jsonwebtoken')
const secret = process.env.SECRET || 'qwerty'

function encode (payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, { algorithm: 'HS256' }, (err, token) => {
      if (err) { return reject(err) }
      resolve(token)
    })
  })
}

function decode (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) { return reject(err) }
      resolve(payload)
    })
  })
}

module.exports = {
  encode: encode,
  decode: decode
}
