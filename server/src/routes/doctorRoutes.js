const express = require('express')
const router = express.Router()

const connection = require('../sqlConnector')

router.get('/login', (req, res) => {
  res.render('./pages/login')
})

router.get('/dashboard', (req, res) => {
  res.render('./pages/doctorDashboard')
})

module.exports = router
