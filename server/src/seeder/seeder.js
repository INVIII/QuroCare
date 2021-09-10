const faker = require('faker')
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'sql11.freemysqlhosting.net',
  user: 'sql11436135',
  password: 'gvTZJSPFK8',
  database: 'sql11436135'
})

function random (n) {
  return Math.floor(Math.random() * n)
}

const deps = ['Cardiology', 'Orthopaedic', 'Neurologist', 'Pharmacology', 'Otorhinolaryngology', 'Psychiatry']
const gender = ['Male', 'Female', 'Non-Binary']
const patData = []
const docData = []

for (let i = 0; i < 10; i++) {
  patData.push([faker.name.firstName(), faker.name.lastName(), faker.internet.email(), faker.phone.phoneNumber(), gender[random(3)], faker.internet.password()])
}

for (let i = 0; i < 10; i++) {
  docData.push([faker.name.firstName(), faker.name.lastName(), deps[random(6)], faker.phone.phoneNumber(), faker.internet.password(), faker.internet.email()])
}

connection.query('INSERT INTO patient (fname, lname, email, phone, gender, password) VALUES ?', [patData], function (err, res) {
  if (err) throw err
  console.log(res)
})

connection.query('INSERT INTO doctor (fname, lname, department, phone, password, email) VALUES ?', [docData], function (err, res) {
  if (err) throw err
  console.log(res)
})

connection.end()
