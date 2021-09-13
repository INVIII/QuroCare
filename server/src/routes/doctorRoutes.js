const express = require('express')
const router = express.Router()

const connection = require('../utils/sqlConnector')

router.get('/login', (req, res) => {
  res.render('./pages/login')
})

router.post('/login', (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT * FROM doctor WHERE email = "${email}" `
  connection.query(q, (err, result) => {
    if (err) throw err
    const doctor=result[0]
    if (result.length === 0) {
      console.log('User Not Found')
      res.redirect('/doctors/login')
    } else {
      password = result[0].password
      if (password === pass) {
        res.render('./pages/doctorDashboard',{doctor})
      } else {
        console.log('Wrong Password')
        res.redirect('/doctors/login')
      }
    }
  })
})

router.get('/dashboard', (req, res) => {
  res.render('./pages/doctorDashboard')
})

module.exports = router
