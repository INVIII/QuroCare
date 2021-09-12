const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'sql11.freemysqlhosting.net',
  user: 'sql11436135',
  password: 'gvTZJSPFK8',
  database: 'sql11436135'
})

module.exports = connection
