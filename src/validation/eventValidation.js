const { body, param } = require('express-validator/check')
exports.validate = (method) => {
  switch (method) {
    // eslint-disable-next-line no-lone-blocks
    case 'addEvent': {
      return [
        body('justForWomen').isBoolean(),
        body('price').isNumeric(),
        body('name')
          .isLength({ min: 3 }),
        body('description')
          .isLength({ min: 3 }),
        body('organiser')
          .isLength({ min: 3 }),
        body('startDate').isLength({ min: 1 }),
        body('endDate').isLength({ min: 1 }),
        body('address')
          .isLength({ min: 3 }),
        body('externalUrls')
          .isLength({ min: 3 }),
        body('ticketNb')
          .isInt({ min: 1 })
      ]
    };
    case 'deleteEvent': {
      return [
        param('id')
          .isInt()
      ]
    }
    case 'deleteTagToEvent' : {
      return [
        param('id')
          .isInt(),
        param('name')
          .isLength({ min: 1 })
      ]
    }
    case 'addTagToEvent' : {
      return [
        param('id')
          .isInt(),
        body('name')
          .isLength({ min: 1 })
      ]
    }
    case 'addSubCategoryToEvent' : {
      return [
        param('id')
          .isInt(),
        body('idSubCategory')
          .isLength({ min: 1 })
      ]
    }
    case 'deleteSubCategory' : {
      return [
        param('id')
          .isInt(),
        param('idSubCategory')
          .isInt()
      ]
    }
    case 'updateImage' : {
      return [
        param('id')
          .isInt(),
        body('imageType').isIn(['ticketImage', 'outherImage', 'eventImage'])
      ]
    }
  }
}
