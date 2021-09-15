const express = require('express')
const session = require('express-session')
const connection = require('../utils/sqlConnector')
// const bcrypt = require('bcrypt')

const router = express.Router()

function protectLogin (req, res, next) {
  if (!session.userID) {
    console.log('Login to continue')
    req.flash('warning', 'Login to continue!')
    return res.redirect('/doctor/login')
  } else if (session.userType === 'patient') {
    req.flash('warning', 'Already logged in as a patient!')
    res.redirect('/patient/dashboard')
  } else {
    next()
  }
}

router.get('/login', (req, res) => {
  if (session.userType === 'patient') {
    req.flash('warning', 'Already logged in as a patient!')
    res.redirect('/patient/dashboard')
  } else if (session.userID) {
    res.redirect('/doctor/dashboard')
  } else {
    res.render('./pages/login', { error: req.flash('error'), warning: req.flash('warning') })
  }
})

router.post('/login', async (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT * FROM doctor WHERE email = "${email}" `
  connection.query(q, async (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    }
    if (result.length === 0) {
      console.log('User Not Found')
      req.flash('error', 'User Not Found!')
      res.redirect('/doctor/login')
    } else {
      password = result[0].password
      // const isCorrect = await bcrypt.compare(pass, password)
      if (pass === password) {
        session.userID = email
        session.userType = 'doctor'
        res.redirect('/doctor/dashboard')
      } else {
        console.log('Wrong Password')
        req.flash('error', 'Wrong Password!')
        res.redirect('/doctor/login')
      }
    }
  })
})

router.post('/logout', (req, res) => {
  session.userID = null
  session.userType = null
  req.flash('success', 'Logged Out!')
  res.redirect('/')
})

router.get('/dashboard', protectLogin, (req, res) => {
  const user = session.userID
  const q = `SELECT * FROM doctor WHERE email = "${user}"`
  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    }
    const doctor = result[0]
    res.render('./pages/doctorDashboard', { doctor, warning: req.flash('warning') })
  })
})

router.get('*', (req, res) => {
  res.sendStatus(404)
})

module.exports = router
