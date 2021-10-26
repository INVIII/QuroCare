const express = require('express')
const router = express.Router()
const connection = require('../utils/sqlConnector')

router.get('/', (req, res) => {
  res.render('./pages/home', { success: req.flash('success'), error: req.flash('error') })
})

router.get('/admin', (req, res) => {
  res.render('./pages/admin')
})

router.get('/addroom', (req,res) => {
  res.render('./pages/addroom', {warning: req.flash('warning'), success: req.flash('success')})
})

router.post('/addroom', (req,res) => {
  const {roomID} = req.body
  let q = `SELECT * FROM room WHERE roomid = '${roomID}'`
  connection.query(q, (err,result) => {
    if(err) {
      console.log(err)
      req.flash('error', 'An error has occured please contact Admin')
      res.redirect('/')
    }
    if(result.length > 0) {
      req.flash('warning', 'Please enter an unique id for the Room')
      res.redirect('/addroom')
    }
    else {
      q = `INSERT INTO room (roomid, occupied) VALUES ('${roomID}',0)`
      connection.query(q, (err1, result1) => {
        if(err1) {
          console.log(err)
          req.flash('error', 'An error has occured please contact Admin')
          res.redirect('/')
        }
        else {
          req.flash('success', 'Room added successfully')
          res.redirect('/addroom')
        }
      })
    }
  })
})
module.exports = router
