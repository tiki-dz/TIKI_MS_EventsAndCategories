const { validationResult } = require('express-validator/check')
const { Category } = require('../models/Category')

// ***********************************************************
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: category } = data
  const currentPage = page ? +page : 0
  const totalPages = Math.ceil(totalItems / limit)
  return { totalItems, category, totalPages, currentPage }
}
const getPagination = (page, size) => {
  const limit = size ? +size : 10
  const offset = page ? page * limit : 0
  return { limit, offset }
}
// ***********************************************************

async function addCategory (req, res) {
  // check if data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }

  try {
    const data = req.body
    const category = await Category.create({
      name: data.name,
      description: data.description,
      icon: data.icon
    })
    return res.status(200).send({ data: category, success: true, message: 'one category added successfully' })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function updateCategory (req, res) {
  // check if data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }

  try {
    const data = req.body
    const category = await Category.findByPk(data.idCategory)
    if (category !== null) {
      category.name = (data.name == null) ? category.name : data.name
      category.description = (data.description == null) ? category.description : data.description
      category.icon = (data.icon == null) ? category.icon : data.icon
      await category.save()
      return res.status(200).send({ data: category, success: true, message: 'one category updated successfully' })
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function getAllCategories (req, res) {
  try {
    const { page, size } = req.query
    const { limit, offset } = getPagination(page, size)
    await Category.findAndCountAll({
      limit,
      offset
    }).then(data => {
      const response = getPagingData(data, page, limit)
      return res.status(200).send({ data: response, success: true })
    })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function getByIdCategories (req, res) {
  try {
    const data = req.body
    const category = await Category.findByPk(data.idCategory)
    if (category !== null) {
      return res.status(200).send({ data: category, success: true })
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function deleteCategory (req, res) {
  try {
    const data = req.body
    const category = await Category.findByPk(data.idCategory)
    if (category !== null) {
      category.destroy()
      return res.status(200).send({ success: true, message: 'category deleted successfully' })
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function getCategoryFiltered (req, res) {
  try {
    return res.status(200).send({ data: 'response', success: true })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
module.exports = { addCategory, updateCategory, getAllCategories, getByIdCategories, getCategoryFiltered, deleteCategory }
