const express = require('express')
const router = express.Router()
const adminRoutes = require('./adminRoutes')

router.get('/index', (req, res) => {
  res.send('3000')
})

router.use('/admin', adminRoutes)

module.exports = router
