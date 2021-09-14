const express = require('express')
const session = require('express-session')
const connection = require('../utils/sqlConnector')
// const bcrypt = require('bcrypt')

const router = express.Router()

function protectLogin (req, res, next) {
  if (!session.userID) {
    console.log('Login to continue')
    return res.redirect('/doctor/login')
  } else if (session.userType === 'patient') {
    res.redirect('/patient/dashboard')
  } else {
    next()
  }
}

router.get('/login', (req, res) => {
  if (session.userType === 'patient') {
    res.redirect('/patient/dashboard')
  } else if (session.userID) {
    res.redirect('/doctor/dashboard')
  } else {
    res.render('./pages/login')
  }
})

router.post('/login', async (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT * FROM doctor WHERE email = "${email}" `
  connection.query(q, async (err, result) => {
    if (err) throw err
    const doctor = result[0]
    if (result.length === 0) {
      console.log('User Not Found')
      res.redirect('/doctor/login')
    } else {
      password = result[0].password
      // const isCorrect = await bcrypt.compare(pass, password)
      if (pass === password) {
        session.userID = email
        session.userType = 'doctor'
        res.render('./pages/doctorDashboard', { doctor })
      } else {
        console.log('Wrong Password')
        res.redirect('/doctor/login')
      }
    }
  })
})

router.post('/logout', (req, res) => {
  session.userID = null
  session.userType = null
  res.redirect('/')
})

router.get('/dashboard', protectLogin, (req, res) => {
  const user = session.userID
  const q = `SELECT * FROM doctor WHERE email = "${user}"`
  connection.query(q, (err, result) => {
    if (err) throw err
    const doctor = result[0]
    res.render('./pages/doctorDashboard', { doctor })
  })
})

module.exports = router
