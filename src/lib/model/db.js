'use strict'

const level = require('level')
const sublevel = require('level-sublevel')
const path = require('path')
const dbpath = path.resolve(process.env.ROOT_DIR, 'db')

module.exports = sublevel(level(dbpath, {
  valueEncoding: 'json'
}))
