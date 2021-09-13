const express = require('express')
const session = require('express-session')
const router = express.Router()
const connection = require('../utils/sqlConnector')

function protectLogin (req, res, next) {
  if (!session.userID) {
    console.log('Login to continue')
    return res.redirect('/patient/login')
  } else {
    next()
  }
}

// login logic
router.get('/login', (req, res) => {
  if (!session.userID) {
    res.render('./pages/login')
  } else {
    res.redirect('/patient/dashboard')
  }
})

router.post('/login', (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT password FROM patient WHERE email = "${email}" `
  connection.query(q, (err, result) => {
    if (err) throw err
    if (result.length === 0) {
      console.log('User Not Found')
      res.redirect('/patient/login')
    } else {
      password = result[0].password
      if (password === pass) {
        session.userID = email
        res.redirect('/patient/dashboard')
      } else {
        console.log('Wrong Password')
        res.redirect('/patient/login')
      }
    }
  })
})

// logout logic
router.post('/logout', (req, res) => {
  session.userID = null
  res.redirect('/')
})

router.get('/dashboard', protectLogin, (req, res) => {
  const user = session.userID
  const q = `SELECT * FROM patient WHERE email = "${user}"`
  connection.query(q, (err, result) => {
    if (err) throw err
    const patient = result[0]
    res.render('./pages/patientDash', { patient })
  })
})

router.get('/register', (req, res) => {
  if (!session.userID) {
    res.render('./pages/register')
  } else {
    res.redirect('/patient/dashboard')
  }
})

router.get('/appointment', protectLogin, (req, res) => {
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

module.exports = router
