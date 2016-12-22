'use strict'

const router = require('router')
const role = require('./role')
const frontend = require('./routes/frontend')
const backend = require('./routes/backend')
const model = require('./model')
const BetterError = require('./BetterError')

const auth = require('./mid/auth')
const layout = require('./mid/layout')
const body = require('./mid/body')
const query = require('./mid/query')
const redirect = require('./mid/redirect')
const session = require('./mid/session')
const asset = require('./mid/asset')
const view = require('./mid/view')
const local = require('./mid/local')
const compression = require('./mid/compression')

let app = router()

app = compression(app)
app = local(app)
app = asset(app)
app = session(app)
app = auth(app)
app = query(app)
app = body(app)
app = view(app)
app = layout(app)
app = redirect(app)

app.use('/', frontend)
app.use('/admin/', role.isAdmin, backend)

module.exports = app
