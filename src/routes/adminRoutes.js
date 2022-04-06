const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.post('/category', adminController.addCategory)
router.patch('/category', adminController.updateCategory)
router.get('/category', adminController.getAllCategories)
router.get('/category/id', adminController.getByIdCategories)
router.get('/category', adminController.getCategoryFiltered) // with filters
router.delete('/category/id', adminController.deleteCategory)

module.exports = router
