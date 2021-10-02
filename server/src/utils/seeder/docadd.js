const connection = require('../sqlConnector')
const { nanoid } = require('nanoid')

const docData = [[nanoid(), 'Dev', 'Sharma', 'Cardiology', '9090909090', 'Dev1111', 'dev@email.com', 1000]]

connection.query('INSERT INTO doctor (_id, fname, lname, department, phone, password, email, fees) VALUES ?', [docData], function (err, res) {
  if (err) throw err
  console.log(res)
})
