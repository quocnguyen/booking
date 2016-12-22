'use strict'

const logger = require('pino')()
logger.level = process.env.LOG_LEVEL || 'info'

module.exports = logger
