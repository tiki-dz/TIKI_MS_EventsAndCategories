const { body } = require('express-validator')
// const { param } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    // eslint-disable-next-line no-lone-blocks
    case 'addCategory': {
      return [
        body('name')
          .isLength({ min: 3 })
      ]
    }
    case 'addSubCategory': {
      return [
        body('name')
          .isLength({ min: 3 })
      ]
    }
  }
}
