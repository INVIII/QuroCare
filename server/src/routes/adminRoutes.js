const express = require("express");
const session = require("express-session");
const connection = require("../utils/sqlConnector");
const { nanoid } = require('nanoid')

const router = express.Router()

function protectLogin (req, res, next) {
  if (!session.userID) {
    console.log('Login to continue')
    req.flash('Warning', 'Login to continue!')
    return res.redirect('/admin/login')
  } else if (session.userType === 'patient' || session.userType === 'doctor') {
    req.flash('Warning', 'Already logged in!')
    res.redirect('/')
  } else {
    next()
  }
}

router.get('/login', (req, res) => {
  if (session.userType === 'patient' || session.userType === 'doctor') {
    req.flash('warning', 'Already logged in!')
    res.redirect('/')
  } else if (session.userID) {
    res.redirect('/admin/dashboard')
  } else {
    res.render('./pages/login', {
      error: req.flash('error'),
      warning: req.flash('warning'),
      userType: 'admin'
    })
  }
})

router.post('/login', async (req, res) => {
  const { email, pass } = req.body
  let password = ''
  const q = `SELECT * FROM admin WHERE name = "${email}" `
  connection.query(q, async (err, result) => {
    if (err) {
      req.flash('error', 'An error has occured! Please contact admin')
      res.redirect('/')
    } else if (!result || result.length === 0) {
      console.log('User Not Found')
      req.flash('error', 'User Not Found!')
      res.redirect('/admin/login')
    } else {
      password = result[0].password
      if (pass === password) {
        session.userID = email
        session.userType = 'admin'
        res.redirect('/admin/dashboard')
      } else {
        console.log('Wrong Password')
        req.flash('error', 'Wrong Password!')
        res.redirect('/admin/login')
      }
    }
  })
})

router.get('/dashboard', protectLogin, async (req, res) => {
  let admitted, waiting, freerooms

  let q = 'SELECT patient.fname, patient.lname, room.roomid FROM occupies, patient, room WHERE room.roomid = occupies.roomid AND patient._id = occupies.pat_id'
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err)
      req.flash('error', 'An error has occured please contact Admin')
      res.redirect('/')
    } else {
      q = 'SELECT roomid FROM room WHERE occupied = 0'
      connection.query(q, (err1, result1) => {
        if (err1) {
          console.log(err1)
          req.flash('error', 'An error has occured please contact Admin')
          res.redirect('/')
        } else {
          q =
               'SELECT patient.fname AS pfname, patient.lname AS plname, doctor.fname AS dfname, doctor.lname AS dlname FROM waiting, doctor, patient WHERE patient._id = waiting.pat_id AND waiting.doc_id = doctor._id'
          connection.query(q, (err2, result2) => {
            if (err2) {
              console.log(err1)
              req.flash(
                'error',
                'An error has occured please contact Admin'
              )
              res.redirect('/')
            } else {
              admitted = result
              freerooms = result1
              waiting = result2
              res.render('./pages/admin', {
                admitted,
                freerooms,
                waiting
              })
            }
          })
        }
      })
    }
  })
})

router.get('/allocateroom', protectLogin, (req, res) => {
  // eslint-disable-next-line no-unused-vars
  let rooms = []
  let q = 'SELECT roomid FROM room WHERE room.occupied = 0'
  connection.query(q, (err1, result1) => {
    if (err1) {
      console.log(err1)
      req.flash('error', 'An error has occured please contact Admin')
      res.redirect('/')
    } else {
      rooms = result1
      q =
        'SELECT patient.fname AS p_fname, patient.lname AS p_lname, patient._id AS pat_id, doctor.fname AS d_fname, doctor.lname AS d_lname, waiting._id as waitingId FROM patient, doctor, waiting WHERE waiting.pat_id = patient._id AND waiting.doc_id = doctor._id'
      connection.query(q, (err, result2) => {
        if (err) {
          console.log(err)
          req.flash('error', 'An error has occured please contact Admin')
          res.redirect('/')
        } else {
          const pat = result2
          if (rooms.length === 0) {
            req.flash('warning', 'There are currently no free rooms')
          }
          res.render('./pages/allocateroom', {
            pat,
            rooms,
            warning: req.flash('warning')
          })
        }
      })
    }
  })
})

router.get('/register', protectLogin, (req, res) => {
  res.render('./pages/docReg', { warning: req.flash('warning') })
})

router.post('/register', async (req, res, next) => {
  const { fname, lname, email, phone, dep, fees, pass } = req.body

  const q0 = `SELECT * FROM doctor WHERE email="${email}";`
  connection.query(q0, async (err, result1) => {
    if (err) {
      throw err
    }

    if (result1.length > 0) {
      req.flash('warning', 'This email is already registered!')
      res.redirect('/admin/register')
    } else {
      const id = nanoid()
      const q = `INSERT INTO doctor (_id, fname, lname, email, phone, department, password, fees) VALUES ('${id}', '${fname}', '${lname}', '${email}', '${phone}', '${dep}', '${pass}', '${fees}')`

      connection.query(q, (err1, result) => {
        if (err1) {
          req.flash('error', 'An error has occured! Please contact admin')
          res.redirect('/')
        }
        res.redirect('/admin/dashboard')
      })
    }
  })
})

router.get("/addroom", protectLogin, (req, res) => {
  res.render("./pages/addroom", {
    warning: req.flash("warning"),
    success: req.flash("success"),
  });
});

router.post('/addroom', (req, res) => {
  const { roomID } = req.body
  let q = `SELECT * FROM room WHERE roomid = '${roomID}'`
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err)
      req.flash('error', 'An error has occured please contact Admin')
      res.redirect('/')
    }
    if (result.length > 0) {
      req.flash('warning', 'Please enter an unique id for the Room')
      res.redirect('/addroom')
    } else {
      q = `INSERT INTO room (roomid, occupied) VALUES ('${roomID}',0)`
      connection.query(q, (err1, result1) => {
        if (err1) {
          console.log(err)
          req.flash('error', 'An error has occured please contact Admin')
          res.redirect('/')
        } else {
          req.flash('success', 'Room added successfully')
          res.redirect('/admin/addroom')
        }
      })
    }
  })
})

router.post('/allocateroom', (req, res) => {
  const { patient, room } = req.body
  let q = `INSERT INTO occupies (pat_id, roomid) VALUES ('${patient}','${room}')`
  connection.query(q, (err1, result1) => {
    if (err1) {
      console.log(err1)
      req.flash('error', 'An error has occured please contact Admin')
      res.redirect('/')
    } else {
      q = `DELETE FROM waiting WHERE pat_id = '${patient}'`
      connection.query(q, (err1, result2) => {
        if (err1) {
          console.log(err1)
          req.flash('error', 'An error has occured please contact Admin')
          res.redirect('/')
        } else {
          q = `UPDATE patient SET admitted = 1 WHERE _id = '${patient}'`
          connection.query(q, (err1, result3) => {
            if (err1) {
              console.log(err1)
              req.flash('error', 'An error has occured please contact Admin')
              res.redirect('/')
            } else {
              q = `UPDATE room SET occupied = 1 WHERE roomid = '${room}'`
              connection.query(q, (err1, result4) => {
                if (err1) {
                  console.log(err1)
                  req.flash(
                    'error',
                    'An error has occured please contact Admin'
                  )
                  res.redirect('/')
                } else {
                  res.redirect('/admin/allocateroom')
                }
              })
            }
          })
        }
      })
    }
  })
})

router.post('/logout', (req, res) => {
  session.userID = null
  session.userType = null
  req.flash('success', 'Logged Out!')
  res.redirect('/')
})

module.exports = router
