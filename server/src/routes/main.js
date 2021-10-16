const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.render('./pages/home', { success: req.flash('success'), error: req.flash('error') })
})

router.get('/admin', (req, res) => {
  res.render('./pages/admin')
})

module.exports = router
