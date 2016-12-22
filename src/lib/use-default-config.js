'use strict'

module.exports = function useDefaultConfig (config, logger) {
  logger = logger || console
  Object.keys(config).forEach(function (key) {
    if (process.env[key]) return

    process.env[key] = config[key]
    logger.info(`Missing config for process.env.${key}. Use default: ${config[key]}`)
  })
}
