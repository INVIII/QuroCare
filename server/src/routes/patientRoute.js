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
      console.log(err)
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    } else {
      let isCorrect = 0
      let validEmail = 0
      if (result.length !== 0) {
        password = result[0].password
        validEmail = 1
        isCorrect = await bcrypt.compare(pass, password)
      }
      if (isCorrect) {
        session.userID = result[0]._id
        session.userType = 'patient'
        res.redirect('/patient/dashboard')
      } else if (!validEmail) {
        req.flash('error', 'Email not registered!')
        res.redirect('/patient/login')
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

router.get('/dashboard', protectLogin, async (req, res) => {
  const user = session.userID
  let q = `SELECT doctor.fname, doctor.lname, doctor.department, appointment.Date FROM doctor, appointment WHERE appointment.pat_id = "${user}" AND doctor._id = appointment.doc_id AND appointment.doc_s = 0`
  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
      // console.log(err)
    }
    // console.log(result);
    const patient = result
    q = `select fname, lname from patient where _id="${user}"`
    connection.query(q, (err1, result1) => {
      if (err1) {
        req.flash('error', 'An error has occured! Please contact admin')
        res.redirect('/')
        // console.log(err1)
      }
      const name = result1
      q = 'SELECT * FROM room WHERE occupied=0'
      connection.query(q, async (err2, result2) => {
        if (err2) {
          req.flash('error', 'An error has occured! Please contact admin')
          res.redirect('/')
        } else {
          const beds = result2
          q = `SELECT doctor.fname, doctor.lname, prescription.disease FROM doctor, prescription WHERE prescription.pat_id = '${user}' AND prescription.doc_id = doctor._id`
          connection.query(q, (err3, result3) => {
            if (err3) {
              console.log(err3)
              req.flash('error', 'An error has occured! Please contact admin')
              res.redirect('/')
            } else {
              const prescription = result3
              res.render('./pages/patientdash', {
                name,
                patient,
                beds,
                prescription,
                warning: req.flash('warning'),
                success: req.flash('success')
              })
            }
          })
        }
      })
      // console.log(name)
    })
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

  const q0 = `SELECT * FROM patient WHERE email="${email}";`
  connection.query(q0, async (err, result1) => {
    if (err) {
      throw err
    }

    if (result1.length > 0) {
      req.flash('warning', 'This email is already registered!')
      res.redirect('/patient/register')
    } else {
      const hash = await bcrypt.hash(pass, 12)
      const id = nanoid()

      const q = `INSERT INTO patient (_id, fname, lname, email, phone, gender, password, admitted) VALUES ('${id}', '${fname}', '${lname}', '${email}', '${phone}', '${gender}', '${hash}', 0)`

      connection.query(q, (err1, result) => {
        if (err1) {
          req.flash('error', 'An error has occured! Please contact admin')
          res.redirect('/')
        }

        session.userID = id
        session.userType = 'patient'
        res.redirect('/patient/dashboard')
      })
    }
  })
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
  let pat = ''
  switch (dat) {
    case 1:
      pat = '9:30'
      break
    case 2:
      pat = '12:30'
      break
    case 3:
      pat = '3:30'
      break
    case 4:
      pat = '5:00'
      break
  }
  return pat
}

const getA = (ag) => {
  let age = ''
  switch (ag) {
    case 1:
      age = 'Infant'
      break
    case 2:
      age = 'Child'
      break
    case 3:
      age = 'Adult'
      break
    case 4:
      return 'Senior Citizen'
      break
  }
  return age
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

router.get('/prescription', protectLogin, (req, res) => {
  // get doctors name disease allergies and feedback and show them on the table
  // if required date also
  const patId = session.userID
  let q = `SELECT doctor.fname AS fname, doctor.lname AS lname, disease, allergies, feedback FROM doctor,prescription WHERE doctor._id = prescription.doc_id AND prescription.pat_id = '${patId}'`
  connection.query(q, (err, result) => {
    if (err) {
      const newLocal = 'An error has occured! Please contact admin'
      req.flash('error', newLocal)
      console.log(err)
      res.redirect('/')
    } else {
      const prescription = result
      const patID = session.userID
      q = `SELECT patient.fname, patient.lname FROM patient WHERE _id = "${patID}"`
      connection.query(q, (err1, result1) => {
        if (err1) {
          const newLocal = 'An error has occured! Please contact admin'
          req.flash('error', newLocal)
          console.log(err1)
          res.redirect('/')
        } else {
          const name = result1
          res.render('./pages/prescription', {
            name,
            prescription,
            warning: req.flash('warning'),
            success: req.flash('success')
          })
        }
      })
    }
  })
})

module.exports = router
