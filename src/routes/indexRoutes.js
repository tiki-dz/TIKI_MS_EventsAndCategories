const express = require('express')
const router = express.Router()

router.get('/index', (req, res) => {
  res.send('3000')
})
module.exports = router
