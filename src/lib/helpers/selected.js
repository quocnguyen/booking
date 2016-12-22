'use strict'
module.exports = function (val, attr) {
  attr = attr || 'val'
  return function () {
    if (this[attr] === val) return 'selected'
    return ''
  }
}
