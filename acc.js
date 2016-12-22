#!/usr/bin/env node

'use strict'
process.env.ROOT_DIR = require('path').resolve(__dirname)
const model = require('./src/lib/model')
const co = require('co')
const cli = require('commander')

cli
  .version('0.0.1')
  .description('cli tool to create admin account')

cli
  .command('create <username> <password>')
  .action(createUser)

// cli
//   .command('ls')

cli.parse(process.argv)

function createUser (username, password) {
  co(function* () {
    let id = yield model.userdb.findId(username)
    if (id !== null) {
      throw new Error('exist_username')
    }

    let user = yield model.userdb.create({
      username: username,
      password: password,
      role: 'admin'
    })

    console.log(user.id)
  }).catch(onError)
}

function onError (err) {
  console.log(err.message)
  process.exit(1)
}
