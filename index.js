'use strict'

const path = require('path')
process.env.ROOT_DIR = path.resolve(__dirname)
require('dotenv').config({silent: true})
const logger = require('./src/lib/logger')
const server = require('./src/server')

require('./src/lib/use-default-config')({
  NODE_ENV: 'development',
  PORT: 3000,
  TS: 'Asia/Ho_Chi_Minh',
  DATE_FORMAT: 'DD-MM-YYYY',
  LOG_LEVEL: 'info',
  COMPRESSION_LEVEL: 1,
  SESSION_SECRET: '582a4c90df12e'
}, logger)

server.listen(process.env.PORT, function () {
  logger.info(`app start listen on PORT ${process.env.PORT}`)
  if (process.env.NODE_ENV) {
    logger.info(`http://localhost:${process.env.PORT}`)
  }
})
