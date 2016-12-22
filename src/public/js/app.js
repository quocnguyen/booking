(function ($) {
  'use strict'
  $(document).ready(init)

  function init () {
    $('table').on('click', '.del', function del (e) {
      e.preventDefault()
      var msg = $(this).attr('confirm-msg') || 'Bạn có chắc muốn xoá dữ liệu này ?'

      var self = this
      var yes = window.confirm(msg)
      if (!yes) return

      var url = $(self).attr('href')
      $.get(url).done(function () {
        $(self).parents('tr').fadeOut()
      })
    })
  }
})(window.jQuery)
