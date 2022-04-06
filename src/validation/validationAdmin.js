const { body } = require('express-validator/check')
// const { param } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    // eslint-disable-next-line no-lone-blocks
    case 'addCategory': {
      return [
        body('name')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('Name must be alphabetic.')
          .isLength({ min: 3 })
      ]
    }
  }
}
