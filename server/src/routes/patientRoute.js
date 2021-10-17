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
      return 0
    } else {
      return 1
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
    res.render('./pages/login', { error: req.flash('error'), warning: req.flash('warning'), userType: 'patient' })
  }
})

router.post('/login', async (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT password, _id FROM patient WHERE email = "${email}" `
  connection.query(q, async (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    } else {
      password = result[0].password
      const isCorrect = await bcrypt.compare(pass, password)
      if (isCorrect) {
        session.userID = result[0]._id
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
  let q = `SELECT patient.fname AS p_fname, patient.lname AS p_lname, doctor.fname, doctor.lname, doctor.department, appointment.Date FROM doctor, appointment, patient WHERE patient._id = "${user}" AND appointment.pat_id = "${user}" AND doctor._id = appointment.doc_id`
  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
      // console.log(err)
    }
    // console.log(result);
    const patient = result
    res.render('./pages/patientDash', { patient, warning: req.flash('warning'), success: req.flash('success') })
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

  if (already(email) === 1) {
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
      session.userID = result[0]._id
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
          // add id of doctor here
          const temp = { name: i.fname + ' ' + i.lname, id: i._id, fees: i.fees }
          departments[j].doctors.push(temp)
          break
        }
      }
    }
    res.render('./pages/appointment', { departments })
  })
})

const getT = (dat) => {
  switch (dat) {
    case 1:
      return '9:30'
    case 2:
      return '12:30'
    case 3:
      return '3:30'
    case 4:
      return '5:00'
    default:
      return '12:30'
  }
}

const getA = (ag) => {
  switch (ag) {
    case 1:
      return 'Infant'
    case 2:
      return 'Child'
    case 3:
      return 'Adult'
    case 4:
      return 'Senior Citizen'
    default:
      return 'Adult'
  }
}

router.post('/appointment', (req, res) => {
  const patEmail = session.userID
  const { OPD, doctor, date, time, address, age, phone, Details } = req.body
  const docID = doctor.split(' ')[4]

  const q = `SELECT * FROM patient WHERE _id = "${patEmail}"`
  let patID
  let q0 = ''

  const tim = getT(time)
  const ag = getA(age)

  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    }
    console.log(result[0]._id)
    patID = result[0]._id
    // to use all inputs from the post using chnges in schema of appointment table
    q0 = `INSERT INTO appointment (_id, pat_id, doc_id, Date, pat_s, doc_s, details, time, address, age, phone) VALUES ("${nanoid()}", "${patID}", "${docID}", "${date}", 0, 0, "${Details}", "${tim}", "${address}", "${ag}","${phone}")`

    connection.query(q0, (error, result) => {
      if (error) {
        const newLocal = 'An error has occured! Please contact admin'
        req.flash('error', newLocal)
        console.log(error)
        res.redirect('/')
      }
      req.flash('success', 'Appointment have been added')
      res.redirect('/patient/dashboard')
    })
  })
})

module.exports = router
