const express = require('express')
const router = express.Router()
const path = require('path')
const json = require(path.join(__dirname, '..', '..', 'proxy.json'))

const { departments } = json

router.get('/', (req, res) => {
  res.render('./pages/home')
})

router.get('/login', (req, res) => {
  res.render('./pages/login')
})

router.get('/register', (req, res) => {
  res.render('./pages/register')
})

router.get('/appointment', (req, res) => {
  res.render('./pages/bookapp', { departments })
})

router.get('/dashboard', (req, res) => {
  res.render('./pages/dash')
})

router.get("/admindash", (req, res) => [res.render("./pages/admindash")]);

module.exports = router
