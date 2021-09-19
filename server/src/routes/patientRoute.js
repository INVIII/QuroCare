const express = require('express')
const session = require('express-session')
const connection = require('../utils/sqlConnector')
const bcrypt = require('bcrypt')
const { nanoid } = require('nanoid')

const router = express.Router()

function protectLogin (req, res, next) {
  if (!session.userID) {
    console.log('Login to continue')
    req.flash('warning', 'Login to continue!')
    return res.redirect('/patient/login')
  } else if (session.userType === 'doctor') {
    req.flash('warning', 'Already logged in  as a doctor!')
    res.redirect('/doctor/dashboard')
  } else {
    next()
  }
}

function already (email) {
  const q0 = `SELECT * FROM patient WHERE email="${email}";`
  connection.query(q0, (err, result) => {
    if (err) {
      throw err
    }
    if (result.length === 0) {
      return 'not-ok'
    } else {
      return 'ok'
    }
  })
}

// login logic
router.get('/login', (req, res) => {
  if (session.userType === 'doctor') {
    req.flash('warning', 'Already logged in as a doctor!')
    res.redirect('/doctor/dashboard')
  } else if (session.userID) {
    res.redirect('/patient/dashboard')
  } else {
    res.render('./pages/login', { error: req.flash('error'), warning: req.flash('warning') })
  }
})

router.post('/login', async (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT password FROM patient WHERE email = "${email}" `
  connection.query(q, async (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    }
    if (result.length === 0) {
      // console.log('User Not Found')
      req.flash('error', 'User Not Found!')
      res.redirect('/patient/login')
    } else {
      password = result[0].password
      const isCorrect = await bcrypt.compare(pass, password)
      if (isCorrect) {
        session.userID = email
        session.userType = 'patient'
        res.redirect('/patient/dashboard')
      } else {
        req.flash('error', 'Wrong Password!')
        // console.log('Wrong Password')
        res.redirect('/patient/login')
      }
    }
  })
})

// logout logic
router.post('/logout', (req, res) => {
  session.userID = null
  session.userType = null
  req.flash('success', 'Logged Out!')
  res.redirect('/')
})

router.get('/dashboard', protectLogin, (req, res) => {
  const user = session.userID
  const q = `SELECT * FROM patient WHERE email = "${user}"`
  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    }
    const patient = result[0]
    res.render('./pages/patientDash', { patient, warning: req.flash('warning') })
  })
})

// register logic

router.get('/register', (req, res) => {
  if (!session.userID) {
    res.render('./pages/register', { warning: req.flash('warning') })
  } else if (session.userType === 'doctor') {
    req.flash('warning', 'Already Logged in as a doctor!')
    res.redirect('/doctor/dashboard')
  } else {
    res.redirect('/patient/dashboard')
  }
})

router.post('/register', async (req, res, next) => {
  const { fname, lname, email, phone, gender, pass } = req.body

  if (already(email) !== 'ok') {
    console.log('io')
    req.flash('warning', 'This email is already registered!')
    res.redirect('/patient/register')
  } else {
    const hash = await bcrypt.hash(pass, 12)
    const id = nanoid()

    const q = `INSERT INTO patient (_id, fname, lname, email, phone, gender, password, admitted) VALUES ('${id}', '${fname}', '${lname}', '${email}', '${phone}', '${gender}', '${hash}', 0)`

    connection.query(q, (err, result) => {
      if (err) {
        req.flash('error', 'An error has occured! Please contact admin')
        res.redirect('/')
      }
      session.userID = email
      session.userType = 'patient'
      res.redirect('/patient/dashboard')
    })
  }
})

router.get('/appointment', protectLogin, (req, res) => {
  const q = 'SELECT * FROM doctor'
  const departments = [{ name: 'Cardiology', doctors: [] }, { name: 'Orthopaedic', doctors: [] }, { name: 'Neurologist', doctors: [] }, { name: 'Pharmacology', doctors: [] }, { name: 'Physiology', doctors: [] }, { name: 'Psychiatry', doctors: [] }]

  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    }
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
