const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.render('./pages/home')
})

router.get('/login', (req, res) => {
  res.render('./pages/login-test')
})

router.get('/register', (req, res) => {
  res.render('./pages/register')
})

module.exports = router
