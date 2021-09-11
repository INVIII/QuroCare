const express = require('express')
const router = express.Router()

router.get('/dashboard', (req, res) => {
  res.render('./pages/doctordash')
})

module.exports = router
