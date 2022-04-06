const express = require('express')
const router = express.Router()
const adminRoutes = require('./adminRoutes')
router.use('/admin', adminRoutes)
module.exports = router
