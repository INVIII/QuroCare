const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'remotemysql.com',
  user: '787yC9r1m0',
  password: 'uLk5oGqfuY',
  database: '787yC9r1m0'
})

module.exports = connection
