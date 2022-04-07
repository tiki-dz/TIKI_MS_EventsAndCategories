const express = require('express')
const router = express.Router()
const eventController = require('../controllers/eventController')
const validation = require('../validation/eventValidation')

router.post('/event', validation.validate('addEvent'), eventController.addEvent)
router.get('/event', validation.validate('addEvent'), eventController.getAllEvents)
router.delete('/event/:id', validation.validate('deleteEvent'), eventController.deleteEvent)
router.post('/event/:id/tag', validation.validate('addTagToEvent'), eventController.addTagToEvent)
router.post('/event/:id/subcategory', validation.validate('addSubCategoryToEvent'), eventController.addSubCategory)
router.delete('/event/:id/tag', validation.validate('addTagToEvent'), eventController.deleteTag)
router.delete('/event/:id/subcategory', validation.validate('deleteSubCategory'), eventController.deleteSubcategory)
module.exports = router
