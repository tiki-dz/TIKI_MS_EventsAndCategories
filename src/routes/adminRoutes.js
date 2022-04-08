const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const subCategoryController = require('../controllers/subcategoryController')
const validationAdmin = require('../validation/validationAdmin')

router.post('/subCategory', validationAdmin.validate('addSubCategory'), subCategoryController.addSubCategory)
router.post('/category', validationAdmin.validate('addCategory'), categoryController.addCategory)

router.patch('/subCategory', validationAdmin.validate('addSubCategory'), subCategoryController.updateSubCategory)
router.get('/subCategory', subCategoryController.getAllSubCategories)
router.get('/subCategory/:id', subCategoryController.getByIdSubCategories)
router.get('/Category/:id/subCategory/', subCategoryController.getSubCategoriesByIdCategories)
router.delete('/subCategory/:id', subCategoryController.deleteSubCategory)
router.patch('/category', validationAdmin.validate('addCategory'), categoryController.updateCategory)
router.get('/category', categoryController.getAllCategories)
router.get('/category/:id', categoryController.getByIdCategories)
router.delete('/category/:id', categoryController.deleteCategory)

module.exports = router
