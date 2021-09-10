const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'sql11.freemysqlhosting.net',
  user: 'sql11436135',
  password: 'gvTZJSPFK8',
  database: 'sql11436135'
})

const queries = []

queries.push('CREATE TABLE patient (fname varchar(15) NOT NULL, lname varchar(15) NOT NULL, email varchar(50), phone varchar(13), gender varchar(15), password varchar(100), PRIMARY KEY(email));', 'CREATE TABLE doctor (fname varchar(15) NOT NULL, lname varchar(15) NOT NULL, department varchar(15) NOT NULL, phone varchar(13) NOT NULL, password varchar(100) NOT NULL, email varchar(50), PRIMARY KEY(email));')

for (let i of queries) {
  connection.query(i, function (err, res) {
    if (err) throw err
    console.log(res)
  })
}

connection.end()
