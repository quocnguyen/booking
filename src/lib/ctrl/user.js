'use strict'

const co = require('co')
const BetterError = require('../BetterError')
const passport = require('passport')
const model = require('../model')
const selected = require('../helpers/selected')
const roles = require('../json/roles.json')

exports.login = login
exports.handleLogin = handleLogin
exports.logout = logout
exports.create = create
exports.handleCreate = handleCreate
exports.edit = edit
exports.handleEdit = handleEdit
exports.list = list
exports.handleDelete = handleDelete
exports.defaultAdmin = defaultAdmin

function login (req, res, next) {
  if (req.user && req.query.redirect) return res.redirect(req.query.redirect)
  if (req.user && req.user.role === 'admin') return res.redirect('/admin')
  if (req.user && req.user.role === 'member') return res.redirect('/resources')

  res.setLayout('frontend.html').render('user/login.html')
}

function handleLogin (req, res, next) {
  const body = req.body
  co(function * () {
    if (!body.username) {
      throw new BetterError(400, 'Username không được để trống')
    }

    if (!body.password) {
      throw new BetterError(400, 'Paswsord không được để trống')
    }

    passport.authenticate('local', (err, user) => {
      if (err) {
        return next(new BetterError(401, 'username or password invalid'))
      }

      if (user === null) {
        return next(new BetterError(401, 'username or password invalid'))
      }

      req.login(user, (err) => {
        if (err) return next(BetterError(401, 'username or password invalid'))
        if (req.query.redirect) return res.redirect(req.query.redirect)
        if (user.role === 'admin') return res.redirect('/admin')
        if (user.role === 'member') return res.redirect('/resources')

        res.redirect('/admin')
      })
    })(req, res, next)
  })
  .catch(next)
}

function logout (req, res, next) {
  res.setHeader('Surrogate-Control', 'no-store')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  req.logout()
  res.redirect('/login')
}

function create (req, res, next) {
  res
    .setLayout('backend.html')
    .render('user/create.html', {
      roles: roles
    })
}

function handleCreate (req, res, next) {
  co(function * () {
    let body = req.body
    if (!body.username) {
      throw new BetterError(400, 'Tên truy cập không thể để trống')
    }

    if (!body.password) {
      throw new BetterError(400, 'Mật khẩu không thể để trống')
    }

    let isUserNameExist = yield model.userdb.findId(body.username)
    if (isUserNameExist) {
      throw new BetterError(400, 'Tên truy cập đã tồn tại, hãy chọn tên khác')
    }

    yield model.userdb.create(body)
    res.locals.success = 'Đã lưu'
  })
  .then(next)
  .catch(err => {
    res.locals.err = err
    next()
  })
}

function edit (req, res, next) {
  delete req.current.password
  delete req.current.salt

  res
    .setLayout('backend.html')
    .render('user/edit.html', {
      current: req.current,
      roles: roles,
      isSelected: selected(req.current.role, 'id')
    })
}

function handleEdit (req, res, next) {
  let current = req.current
  co(function * () {
    let body = req.body
    if (!body.username) {
      throw new BetterError(400, 'Tên truy cập không thể để trống')
    }

    if (body.username !== current.username) {
      let isUserNameExist = yield model.userdb.findId(body.username)
      if (isUserNameExist) {
        throw new BetterError(400, 'Tên truy cập đã tồn tại, hãy chọn tên khác')
      }
    }

    let passwordAndSalt = {
      password: current.password,
      salt: current.salt
    }

    if (body.password) {
      passwordAndSalt = yield model.userdb.hash(body.password)
    }

    yield model.userdb
      .update(current.id, Object.assign(current, body, passwordAndSalt))
    res.locals.success = 'Đã lưu'
  })
  .then(next)
  .catch(err => {
    res.locals.err = err
    next()
  })
}

function list (req, res, next) {
  co(function * () {
    let users = yield model.userdb.find()
    res
      .setLayout('backend.html')
      .render('user/list.html', {
        users: users
      })
  })
  .catch(next)
}

function handleDelete (req, res, next) {
  co(function * () {
    yield model.userdb.delete(req.current.id)
    res.end()
  })
  .catch(err => {
    res.locals.err = err
    next()
  })
}

function defaultAdmin (req, res, next) {
  co(function * () {
    let id = yield model.userdb.findId('admin')
    if (id !== null) {
      throw new BetterError(500)
    }

    yield model.userdb.create({
      username: 'admin',
      password: '1',
      role: 'admin'
    })
    res.end('Tạo thành công tài khoản admin mặt định')
  })
  .catch(next)
}
