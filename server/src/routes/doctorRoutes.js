const express = require('express')
const router = express.Router()

router.get('/dashboard', (req, res) => {
  res.render('./pages/dash')
})

module.exports = router
