const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const validationAdmin = require('../validation/validationAdmin')

router.post('/category', validationAdmin.validate('addCategory'), categoryController.addCategory)
router.patch('/category', validationAdmin.validate('addCategory'), categoryController.updateCategory)
router.get('/category', categoryController.getAllCategories)
router.get('/category/:id', categoryController.getByIdCategories)
router.get('/category', categoryController.getCategoryFiltered) // with filters
router.delete('/category/:id', categoryController.deleteCategory)

module.exports = router
