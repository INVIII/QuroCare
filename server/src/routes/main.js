const e = require('express')
const express = require('express')
const router = express.Router()
const connection = require('../utils/sqlConnector')

router.get('/', (req, res) => {
  res.render('./pages/home', { success: req.flash('success'), error: req.flash('error') })
})

router.get('/admin', (req, res) => {
  res.render('./pages/admin')
})

router.get('/allocateroom', (req, res) => {
  let q = 'SELECT * From waiting'
  let rooms = []
  // eslint-disable-next-line prefer-const
  let pat = []
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err)
      req.flash('error', 'An error has occured please contact Admin')
      res.redirect('/')
    } else {
      q = 'SELECT roomid FROM room WHERE room.occupied = 0'
      connection.query(q, (err1, result1) => {
        if (err) {
          console.log(err)
          req.flash('error', 'An error has occured please contact Admin')
          res.redirect('/')
        } else {
          result.forEach((waiting) => {
            const docID = waiting.doc_id
            const patID = waiting.pat_id
            q = `SELECT patient.fname AS p_fname, patient.lname AS p_lname, patient._id AS pat_id, doctor.fname AS d_fname, doctor.lname AS d_lname, waiting._id as waitingId FROM patient, doctor, waiting WHERE waiting._id = '${waiting._id}' AND doctor._id = '${docID}' AND patient._id = '${patID}'`
            connection.query(q, (err, result2) => {
              if (err) {
                console.log(err)
                req.flash('error', 'An error has occured please contact Admin')
                res.redirect('/')
              } else {
                pat.push(result2)
              }
            })
          })
          rooms = result1
          if (!rooms || rooms.length === 0) {
            req.flash('warning', 'There are currently no free rooms')
          }
          res.render('./pages/allocateroom', { pat, rooms, warning: req.flash('warning') })
        }
      })
    }
  })
})

router.get('/addroom', (req, res) => {
  res.render('./pages/addroom', { warning: req.flash('warning'), success: req.flash('success') })
})

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
          res.redirect('/addroom')
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
      q = `DELETE FROM waiting WHERE pat_id = '${patient}`
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
              q = `UPDATE room SET occupied = 1 WHERE roomid = '${room}`
              connection.query(q, (err1, result4) => {
                if (err1) {
                  console.log(err1)
                  req.flash('error', 'An error has occured please contact Admin')
                  res.redirect('/')
                } else {
                  res.redirect('/allocateroom')
                }
              })
            }
          })
        }
      })
    }
  })
})

module.exports = router
