const express = require('express')
const router = express.Router()

const connection = require('../sqlConnector')

router.get('/', (req, res) => {
  res.render('./pages/home')
})

router.get('/appointment', (req, res) => {
  const q = 'SELECT * FROM doctor'
  const departments = [{ name: 'Cardiology', doctors: [] }, { name: 'Orthopaedic', doctors: [] }, { name: 'Neurologist', doctors: [] }, { name: 'Pharmacology', doctors: [] }, { name: 'Physiology', doctors: [] }, { name: 'Psychiatry', doctors: [] }]

  connection.query(q, (err, result) => {
    if (err) throw err
    for (const i of result) {
      for (let j = 0; j < 6; j++) {
        if (i.department === departments[j].name) {
          const temp = { name: i.fname + ' ' + i.lname, fees: i.fees }
          departments[j].doctors.push(temp)
          break
        }
      }
    }
    res.render('./pages/appointment', { departments })
  })
})

router.post('/appointment', (req, res) => {
  console.log('YOOOOOOOO')
})

router.get('/dashboard', (req, res) => {
  res.render('./pages/dash')
})

router.get('/admin', (req, res) => [res.render('./pages/admin')])

module.exports = router
