'use strict'

const db = require('./model/db')
module.exports = {
  db: db,
  userdb: require('./model/userdb')(db),
  resourcedb: require('./model/resourcedb')(db),
  classroomdb: require('./model/classroomdb')(db),
  bookingdb: require('./model/bookingdb')(db)
}
