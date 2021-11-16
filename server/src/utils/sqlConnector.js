const mysql = require('mysql')
const { host, user, password, database } = require('./config');

const connection = mysql.createConnection({
  host: process.env.HOST || host,
  user: process.env.USER || user,
  password: process.env.PASSWORD || password,
  database: process.env.DATABASE || database
})

module.exports = connection
