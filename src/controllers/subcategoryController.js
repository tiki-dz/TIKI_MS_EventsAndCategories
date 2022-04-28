const { default: axios } = require('axios')
const { validationResult } = require('express-validator')
const { SubCategory } = require('../models')
const { sequelize } = require('../models')
const { Category } = require('../models')
const { QueryTypes } = require('sequelize')

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
    let category = await Category.findByPk(data.idCategory)
    if (!category) { res.status(422).send({ success: false, message: 'Category Not found!' }) }
    const subCategory = await SubCategory.findOne({
      where: {
        name: data.name
      }
    })
    category = await Category.findOne({
      where: {
        name: data.name
      }
    })
    if (!subCategory && !category) {
      const category = Category.findByPk(data.idCategory)
      if (category) {
        const subCategory = await SubCategory.create({
          name: data.name,
          description: data.description,
          icon: data.icon,
          CategoryIdCategory: data.idCategory
        })
        return res.status(200).send({ data: subCategory, success: true, message: 'one SubCategory added successfully' })
      } else {
        return res.status(422).send({ success: false, message: 'category dont exist' })
      }
    } else {
      return res.status(422).send({ success: false, message: 'subcategory name already exist' })
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
    const token = req.headers['x-access-token']
    const response = await axios.get('http://localhost:5001/api/tokenCheck', {
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'x-access-token'
      }
    })
    if (response.data.success) {
      const subCategory = await SubCategory.findByPk(data.idSubCategory)
      let subcategorywithsamename = null
      let category = null
      if (data.name !== subCategory.name) {
        subcategorywithsamename = await SubCategory.findOne({
          where: {
            name: data.name
          }
        })
      }
      if (subcategorywithsamename) {
        return res.status(422).send({ success: false, message: 'subcategory name already exist' })
      } else {
        category = await Category.findOne({
          where: {
            name: data.name
          }
        })
        if (category) {
          return res.status(422).send({ success: false, message: 'category name already exist' })
        }
      }
      if (subCategory && !category) {
        category = await Category.findByPk(data.idCategory)
        if (category) {
          subCategory.name = (data.name == null) ? subCategory.name : data.name
          subCategory.description = (data.description == null) ? subCategory.description : data.description
          subCategory.icon = (data.icon == null) ? subCategory.icon : data.icon
          subCategory.CategoryIdCategory = (data.idCategory == null) ? subCategory.CategoryIdCategory : data.idCategory
          await subCategory.save()
          return res.status(200).send({ data: subCategory, success: true, message: 'one SubCategory updated successfully' })
        }
      } else {
        res.status(422).send({ success: false, message: 'Category Not found!' })
      }
    } else { res.status(500).send(response) }
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
      include: [{ model: Category }],
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
    const subCategory = await SubCategory.findOne({
      where: {
        idSubCategory: id
      },
      include: [{ model: Category }]
    })
    if (subCategory !== null) {
      return res.status(200).send({ data: subCategory, success: true })
    } else {
      res.status(422).send({ success: false, message: 'subCategory Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function getSubCategoriesByIdCategories (req, res) {
  try {
    const idCategory = parseInt(req.params.id)
    const category = await Category.findByPk(idCategory)
    if (category) {
      const subCategory = await SubCategory.findAndCountAll({
        where: {
          CategoryIdCategory: idCategory
        },
        include: [{ model: Category }]
      })
      if (subCategory !== null) {
        return res.status(200).send({ data: subCategory, success: true })
      } else {
        res.status(422).send({ success: false, message: 'subCategory Not found!' })
      }
    } else {
      res.status(422).send({ success: false, message: 'Category Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
async function deleteSubCategory (req, res) {
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
      const subCategory = await SubCategory.findByPk(id)
      if (subCategory !== null) {
        const events = await sequelize.query('SELECT * FROM tiki.event_has_subcategory;', { type: QueryTypes.SELECT })
        for (let index = 0; index < events.length; index++) {
          const element = events[index]
          if (element.SubCategoryIdSubCategory === id) {
            return res.status(500).send({ success: false, message: 'subCategory is not Empty!' })
          }
        }
        SubCategory.destroy({
          where: {
            idSubCategory: id
          }
        })
        return res.status(200).send({ success: true, message: 'category deleted successfully' })
      } else {
        res.status(422).send({ success: false, message: 'Category Not found!' })
      }
    } else { res.status(500).send(response) }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
}
module.exports = { addSubCategory, updateSubCategory, getAllSubCategories, getByIdSubCategories, getSubCategoriesByIdCategories, deleteSubCategory }
