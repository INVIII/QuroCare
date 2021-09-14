const express = require('express')
const session = require('express-session')
const connection = require('../utils/sqlConnector')
const bcrypt = require('bcrypt')
const { nanoid } = require('nanoid')

const router = express.Router()

function protectLogin (req, res, next) {
  if (!session.userID) {
    console.log('Login to continue')
    return res.redirect('/patient/login')
  } else if (session.userType === 'doctor') {
    res.redirect('/doctor/dashboard')
  } else {
    next()
  }
}

// login logic
router.get('/login', (req, res) => {
  if (session.userType === 'doctor') {
    res.redirect('/doctor/dashboard')
  } else if (session.userID) {
    res.redirect('/patient/dashboard')
  } else {
    res.render('./pages/login')
  }
})

router.post('/login', async (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT password FROM patient WHERE email = "${email}" `
  connection.query(q, async (err, result) => {
    if (err) throw err
    if (result.length === 0) {
      console.log('User Not Found')
      res.redirect('/patient/login')
    } else {
      password = result[0].password
      const isCorrect = await bcrypt.compare(pass, password)
      if (isCorrect) {
        session.userID = email
        session.userType = 'patient'
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
  session.userType = null
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

// register logic

router.get('/register', (req, res) => {
  if (!session.userID) {
    res.render('./pages/register')
  } else if (session.userType === 'doctor') {
    res.redirect('/doctor/dashboard')
  } else {
    res.redirect('/patient/dashboard')
  }
})

router.post('/register', async (req, res) => {
  const { fname, lname, email, phone, gender, pass } = req.body
  const hash = await bcrypt.hash(pass, 12)
  const id = nanoid()

  const q = `INSERT INTO patient (_id, fname, lname, email, phone, gender, password) VALUES ('${id}', '${fname}', '${lname}', '${email}', '${phone}', '${gender}', '${hash}')`

  connection.query(q, (err, result) => {
    if (err) throw err
    session.userID = email
    session.userType = 'patient'
    res.redirect('/patient/dashboard')
  })
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
