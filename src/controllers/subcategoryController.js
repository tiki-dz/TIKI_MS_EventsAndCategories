const { validationResult } = require('express-validator')
const { SubCategory } = require('../models')

// ***********************************************************
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: SubCategory } = data
  const currentPage = page ? +page : 1
  const totalPages = Math.ceil(totalItems / limit)
  return { totalItems, SubCategory, totalPages, currentPage }
}
const getPagination = (page, size) => {
  const limit = size ? +size : 10
  const offset = page ? page * limit : 0
  return { limit, offset }
}
// ***********************************************************

async function addSubCategory (req, res) {
  // check if data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }
  try {
    const data = req.body
    const subCategory = await SubCategory.findOne({
      where: {
        name: data.name
      }
    })
    if (!subCategory) {
      const subCategory = await SubCategory.create({
        name: data.name,
        description: data.description,
        icon: data.icon
      })
      return res.status(200).send({ data: subCategory, success: true, message: 'one SubCategory added successfully' })
    } else {
      return res.status(422).send({ success: false, message: 'category name already exist' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function updateSubCategory (req, res) {
  // check if data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }

  try {
    const data = req.body
    const subCategory = await SubCategory.findByPk(data.idCategory)
    if (subCategory !== null) {
      SubCategory.name = (data.name == null) ? SubCategory.name : data.name
      SubCategory.description = (data.description == null) ? SubCategory.description : data.description
      SubCategory.icon = (data.icon == null) ? SubCategory.icon : data.icon
      await SubCategory.save()
      return res.status(200).send({ data: SubCategory, success: true, message: 'one SubCategory updated successfully' })
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function getAllSubCategories (req, res) {
  try {
    const page = req.query.page - 1
    const size = req.query.size
    const { limit, offset } = getPagination(page, size)
    await SubCategory.findAndCountAll({
      limit,
      offset
    }).then(data => {
      const response = getPagingData(data, page, limit)
      return res.status(200).send({ data: response, success: true })
    })
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function getByIdSubCategories (req, res) {
  try {
    const id = parseInt(req.params.id)
    const subCategory = await SubCategory.findByPk(id)
    if (subCategory !== null) {
      return res.status(200).send({ data: SubCategory, success: true })
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function deleteSubCategory (req, res) {
  try {
    const id = parseInt(req.params.id)
    const subCategory = await SubCategory.findByPk(id)
    if (subCategory !== null) {
      SubCategory.destroy()
      return res.status(200).send({ success: true, message: 'category deleted successfully' })
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
module.exports = { addSubCategory, updateSubCategory, getAllSubCategories, getByIdSubCategories, deleteSubCategory }
