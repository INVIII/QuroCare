const connection = require('./sqlConnector')

const queries = []

queries.push('CREATE TABLE patient(_id varchar(25) NOT NULL, fname varchar(15) NOT NULL, lname varchar(15) NOT NULL, email varchar(50), phone varchar(13), gender varchar(15), password varchar(255), PRIMARY KEY(email));', 'CREATE TABLE doctor ( _id varchar(25) NOT NULL ,fname varchar(15) NOT NULL, lname varchar(15) NOT NULL, department varchar(15) NOT NULL, phone varchar(13) NOT NULL, password varchar(255) NOT NULL, email varchar(50), fees INT(10) ,PRIMARY KEY(email));')

for (const i of queries) {
  connection.query(i, function (err, res) {
    if (err) throw err
    console.log(res)
  })
}

connection.end()
