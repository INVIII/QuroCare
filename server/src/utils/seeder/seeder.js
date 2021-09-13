const faker = require('faker')
const connection = require('../sqlConnector')

function random (a, b) {
  return Math.floor(Math.random() * a) + b
}

const deps = ['Cardiology', 'Orthopaedic', 'Neurologist', 'Pharmacology', 'Otorhinolaryngology', 'Psychiatry']
const gender = ['Male', 'Female', 'Non-Binary']
const patData = []
const docData = []

for (let i = 0; i < 10; i++) {
  patData.push([faker.name.firstName(), faker.name.lastName(), faker.internet.email(), faker.phone.phoneNumber(), gender[random(3, 0)], faker.internet.password()])
}

for (let i = 0; i < 10; i++) {
  docData.push([faker.name.firstName(), faker.name.lastName(), deps[random(6, 0)], faker.phone.phoneNumber(), faker.internet.password(), faker.internet.email(), random(500, 300)])
}

connection.query('INSERT INTO patient (fname, lname, email, phone, gender, password) VALUES ?', [patData], function (err, res) {
  if (err) throw err
  console.log(res)
})

connection.query('INSERT INTO doctor (fname, lname, department, phone, password, email, fees) VALUES ?', [docData], function (err, res) {
  if (err) throw err
  console.log(res)
})

connection.end()
