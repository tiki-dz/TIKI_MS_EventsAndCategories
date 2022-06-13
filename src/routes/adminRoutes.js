const express = require('express')
const router = express.Router()
const eventController = require('../controllers/eventController')
const validation = require('../validation/eventValidation')
const categoryController = require('../controllers/categoryController')
const subCategoryController = require('../controllers/subcategoryController')
const validationAdmin = require('../validation/validationAdmin')

router.post('/event', validation.validate('addEvent'), eventController.addEvent)
router.get('/event', eventController.getAllEvents)
router.get('/event/:id', eventController.getByIdEvent)
router.post('/event/:id', eventController.editByIdEvent)
router.delete('/event/:id', validation.validate('deleteEvent'), eventController.deleteEvent)
router.post('/event/:id/tag', validation.validate('addTagToEvent'), eventController.addTagToEvent)
router.post('/event/:id/subcategory', validation.validate('addSubCategoryToEvent'), eventController.addSubCategory)
router.delete('/event/:id/tag/:name', validation.validate('deleteTagToEvent'), eventController.deleteTag)
router.delete('/event/:id/subcategory/:idSubCategory', validation.validate('deleteSubCategory'), eventController.deleteSubcategory)
router.patch('/event/:id', validation.validate('deleteEvent'), eventController.patchEvent)
router.put('/event/:id/updateImage', validation.validate('updateImage'), eventController.updateImageTicket)
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
