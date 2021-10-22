const express = require('express')
const session = require('express-session')
const connection = require('../utils/sqlConnector')
const { nanoid } = require('nanoid')
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
    const que = `SELECT appointment._id AS id, patient.fname, patient.lname, appointment.Date, appointment.time, appointment.age, appointment.details, patient.gender, appointment.details FROM appointment, patient, doctor WHERE doctor._id = appointment.doc_id AND appointment.pat_id = patient._id AND  appointment.doc_id = "${user}" AND appointment.doc_s = "0"`
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

router.get('/prescribe/:appId', protectLogin, (req, res) => {
  const { appId } = req.params
  const q = `SELECT patient.fname, patient.lname FROM appointment, patient where appointment._id = "${appId}" AND patient._id = appointment.pat_id`

  // console.log(patId)

  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
      console.log(err)
    }
    // console.log(result)
    const p_name = result[0].fname + ' ' + result[0].lname
    res.render('./pages/pres', { p_name, appId, warning: req.flash('warning') })
  })
})

router.post('/prescribe', (req, res) => {
  const { appId, disease, allergy, feedback } = req.body
  const q = `SELECT pat_id FROM appointment Where _id = "${appId}"`
  connection.query(q, (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
      console.log(err)
    }

    const patId = result[0].pat_id
    const docId = session.userID
    const id = nanoid()
    const currentdate = new Date().toISOString().slice(0, 19).replace('T', ' ')

    // code for inserting the data in prescription table and
    // updating doc_s in appointment

    const que = `INSERT INTO prescription (_id, disease, pat_id, doc_id, allergies, date, feedback) VALUES ('${id}', '${disease}', '${patId}', '${docId}', '${allergy}', '${currentdate}', '${feedback}')`
    connection.query(que, (err1, result1) => {
      if (err1) {
        req.flash('error', 'An error has occured! Please contact admin')
        res.redirect('/')
        console.log(err1)
      }
      const que1 = `UPDATE appointment SET doc_s = 1 WHERE _id='${appId}'`
      connection.query(que1, (err2, result2) => {
        if (err2) {
          req.flash('error', 'An error has occured! Please contact admin')
          res.redirect('/')
          console.log(err2)
        }
        // code to check if the patient is to admitted or not

        if (req.body.admit) {
          const q1 = `SELECT * FROM waiting WHERE pat_id='${patId}'`
          connection.query(q1, (err3, result3) => {
            if (err3) {
              req.flash('error', 'An error has occured! Please contact admin')
              res.redirect('/')
              console.log(err3)
            }
            if (!(result3.length > 0)) {
              const q2 = `SELECT * FROM occupies WHERE pat_id='${patId}'`
              connection.query(q2, (err4, result4) => {
                if (err4) {
                  req.flash(
                    'error',
                    'An error has occured! Please contact admin'
                  )
                  res.redirect('/')
                  console.log(err4)
                }
                if (!(result4.length > 0)) {
                  const id = nanoid()
                  const q3 = `INSERT INTO waiting (_id, pat_id, doc_id) VALUES ('${id}', '${patId}', '${docId}')`
                  connection.query(q3, (err1, resInsert) => {
                    if (err1) {
                      req.flash(
                        'error',
                        'An error has occured! Please contact admin'
                      )
                      res.redirect('/')
                      console.log(err1)
                    }
                    console.log('here')
                    res.redirect('/doctor/dashboard')
                  })
                }
              })
            }
          })
        } else {
          res.redirect('/doctor/dashboard')
        }
      })
    })
  })
})

module.exports = router
