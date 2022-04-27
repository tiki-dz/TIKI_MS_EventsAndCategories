const { body, param } = require('express-validator/check')
exports.validate = (method) => {
  switch (method) {
    // eslint-disable-next-line no-lone-blocks
    case 'addEvent': {
      return [
        body('justForWomen').isBoolean(),
        body('price').isNumeric(),
        body('name')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('Name must be alphabetic.')
          .isLength({ min: 3 }),
        body('description')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('Name must be alphabetic.')
          .isLength({ min: 3 }),
        body('organiser')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('organiser must be alphabetic.')
          .isLength({ min: 3 }),
        body('startDate').isDate(),
        body('endDate').isDate(),
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
