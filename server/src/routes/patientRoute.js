const express = require('express')
const router = express.Router()

const connection = require('../sqlConnector')

router.get('/login', (req, res) => {
  res.render('./pages/login')
})

router.post('/login', (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT * FROM patient WHERE email = "${email}" `
  connection.query(q, (err, result) => {
    if (err) throw err
    const patient=result[0]
    if (result.length === 0) {
      console.log('User Not Found')
      res.redirect('/patient/login')
    } else {
      password = result[0].password
      if (password === pass) {
        res.render('./pages/patientdash',{patient})
      } else {
        console.log('Wrong Password')
        res.redirect('/patient/login')
      }
    }
  })
})

router.get('/register', (req, res) => {
  res.render('./pages/register')
})

module.exports = router
