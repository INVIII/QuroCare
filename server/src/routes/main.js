const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.render('./pages/home')
})

router.post('/appointment', (req, res) => {
  console.log('YOOOOOOOO')
})

router.get('/admin', (req, res) => {
  res.render('./pages/admin')
})

module.exports = router
