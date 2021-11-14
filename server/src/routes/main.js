const e = require('express')
const express = require('express')
const router = express.Router()
const connection = require('../utils/sqlConnector')

router.get('/', (req, res) => {
  res.render('./pages/home', { success: req.flash('success'), error: req.flash('error') })
})

module.exports = router
