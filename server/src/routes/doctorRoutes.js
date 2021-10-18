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
    res.render('./pages/login', { error: req.flash('error'), warning: req.flash('warning'), userType: 'doctor' })
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
        session.userID = result[0]._id
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
  const q = `SELECT * FROM doctor WHERE _id = "${user}"`
  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    }
    const doctor = result[0]
    const que = `SELECT appointment._id AS id, patient.fname, patient.lname, appointment.Date, appointment.time, appointment.age, appointment.details, patient.gender, appointment.details FROM appointment, patient, doctor WHERE doctor._id = appointment.doc_id AND appointment.pat_id = patient._id AND  appointment.doc_id = "${user}" AND appointment.doc_s = "0"`;
    connection.query(que, (e, resu) => {
      if (e) {
        console.log(e)
        req.flash('error', 'An error has occured! Please contact admin')
        res.redirect('/')
      }
      const appData = resu
      res.render('./pages/doctorDashboard', {
        doctor,
        appData,
        warning: req.flash('warning')
      })
    })
  })
})

router.get('/prescribe/:patId', protectLogin, (req, res) => {
  const { patId } = req.params
  const q = `SELECT fname, lname FROM patient where _id = "${ patId }"`

  // console.log(patId)

  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
      console.log(err)
    }
    // console.log(result)
    const p_name = result[0].fname + " " + result[0].lname
    res.render('./pages/pres', {p_name, patId, warning: req.flash('warning') })
  })
  
})

router.post('/prescribe', (req, res) => {
  const { pat_id, disease, allergy, feedback } = req.body
  res.send(req.body)
})

module.exports = router
