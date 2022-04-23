const { default: axios } = require('axios')
const { validationResult } = require('express-validator')
const { Category, SubCategory } = require('../models')

// ***********************************************************
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: category } = data
  const currentPage = page ? +page : 1
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
    const category = await Category.findOne({
      where: {
        name: data.name
      }
    })
    if (!category) {
      const category = await Category.create({
        name: data.name,
        description: data.description,
        icon: data.icon
      })
      return res.status(200).send({ data: category, success: true, message: 'one category added successfully' })
    } else {
      return res.status(422).send({ success: false, message: 'category name already exist' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
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
    const token = req.headers['x-access-token']

    const response = await axios.get('http://localhost:5001/api/tokenCheck', {
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'x-access-token'
      }
    })
    console.log(response.data.success)
    if (response.data.success) {
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
    } else {
      res.status(500).send(response)
      console.log(response)
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function getAllCategories (req, res) {
  try {
    const page = req.query.page - 1
    const size = req.query.size
    const { limit, offset } = getPagination(page, size)
    await Category.findAndCountAll({
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
async function getByIdCategories (req, res) {
  try {
    const id = parseInt(req.params.id)
    const category = await Category.findByPk(id)
    if (category !== null) {
      return res.status(200).send({ data: category, success: true })
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function deleteCategory (req, res) {
  try {
    const token = req.headers['x-access-token']
    const response = await axios.get('http://localhost:5001/api/tokenCheck', {
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'x-access-token'
      }
    })
    if (response.data.success) {
      const id = parseInt(req.params.id)
      const category = await Category.findByPk(id)
      if (category !== null) {
        // test if the category is empty
        const subcategory = await SubCategory.findOne({
          where: {
            CategoryIdCategory: id
          }
        })
        if (!subcategory) {
          // destroy the category
          category.destroy()
          return res.status(200).send({ success: true, message: 'category deleted successfully' })
        } else {
          res.status(422).send({ success: false, message: 'Category is not empty!' })
        }
      } else {
        res.status(422).send({ success: false, message: 'Category Not found!' })
      }
    } else { res.status(500).send(response) }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
module.exports = { addCategory, updateCategory, getAllCategories, getByIdCategories, deleteCategory }
