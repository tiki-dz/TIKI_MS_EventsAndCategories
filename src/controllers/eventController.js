/* eslint-disable prefer-const */
const { validationResult } = require('express-validator/check')
const { SubCategory, Tag, Event, sequelize, Category } = require('../models')
const Op = require('Sequelize').Op
const fs = require('fs')

const addEvent = (req, res, next) => {
  try {
    console.log(req.body)
    console.log(req.files)
    const tags = JSON.parse(req.body.tags) ?? []
    const subcategories = JSON.parse(req.body.subCategory) ?? []
    console.log(tags)
    console.log(subcategories)
    if (!Array.isArray(tags) || !Array.isArray(subcategories)) {
      console.log('here')
      return res.status(422).json({
        errors: ['array format for tags and subcategories are required'],
        success: false,
        message: 'array format for tags and subcategories are required'
      })
    }
    const errors = validationResult(req)
    if (req.files == null) {
      return res.status(422).json({
        errors: ['all files are required'],
        success: false,
        message: 'all files are required'
      })
    }
    if (!req.files.eventImage || !req.files.ticketImage || !req.files.outherImage) {
      return res.status(422).json({
        errors: ['All files are required'],
        success: false,
        message: 'All files are required'
      })
    }
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
        success: false,
        message: 'invalid data'
      })
    }
    // check if subCategory exist
    const checkSubCategoryPromisses = new Promise(function (resolve, reject) {
      for (let i = 0; i < subcategories.length; i++) {
        SubCategory.findOne({
          where: {
            idSubCategory: subcategories[i]
          }
        }).then(function (subCategory) {
          if (!subCategory) {
            return res.status(404).json({
              errors: ['sub category dont exist'],
              success: false,
              message: 'sub category dont exist'
            })
          }
          if (i === subcategories.length - 1) {
            resolve(subcategories)
          }
        })
      }
    })
    checkSubCategoryPromisses.then(function (value) {
      const addTagsPromisses = new Promise(function (resolve, reject) {
        if (tags.length === 0) {
          resolve(tags)
        }
        for (let i = 0; i < tags.length; i++) {
          Tag.findOrCreate({
            where: { name: tags[i] },
            defaults: {
              name: tags[i]
            }
          }).then((tag) => {
            if (i === tags.length - 1) {
              resolve(tags)
            }
          })
        }
      })

      addTagsPromisses.then(function (value) {
        const urlOutherImage = '/Upload/outherImage/' + Date.now().toString().trim() + '1.' + req.files.outherImage.mimetype.split('/')[1]
        const urlTicketImage = '/Upload/ticketImage/' + Date.now().toString().trim() + '2.' + req.files.ticketImage.mimetype.split('/')[1]
        const urlEventImage = '/Upload/eventImage/' + Date.now().toString().trim() + '3.' + req.files.eventImage.mimetype.split('/')[1]
        req.files.outherImage.mv(
          '.' + urlOutherImage
        )
        req.files.ticketImage.mv(
          '.' + urlTicketImage
        )
        req.files.eventImage.mv(
          '.' + urlEventImage
        )
        Event.create({
          name: req.body.name,
          description: req.body.description,
          organiser: req.body.organiser,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          address: req.body.address,
          eventImage: 'http://localhost:5002' + urlEventImage,
          ticketImage: 'http://localhost:5002' + urlTicketImage,
          outherImage: 'http://localhost:5002' + urlOutherImage,
          externalUrls: req.body.externalUrls,
          ticketNb: req.body.ticketNb
        }).then((event) => {
          event.addSubCategory(subcategories).then((result) => {
            event.setTags(tags).then((result) => {
              Event.findOne({
                include: [{
                  model: Tag
                }, {
                  model: SubCategory
                  // specifies how we want to be able to access our joined rows on the returned data
                }
                  // specifies how we want to be able to access our joined rows on the returned data
                ],
                where: {
                  idEvent: event.idEvent
                }
              }).then(event => {
                return res.send(event)
              })
            })
          })
        })
      })
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      errors: [err],
      success: false,
      message: 'preccesing error'
    })
  }
}
const getAllEvents = (req, res) => {
  const { page, size, search, tag, category } = req.query
  const condition = !search ? null : { [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }, { organiser: { [Op.like]: `%${search}%` } }] }
  const conditionTag = !tag ? null : { tagName: { [Op.like]: `%${tag}%` } }
  const conditionCategory = !category ? null : { name: { [Op.like]: `%${category}%` } }
  const { limit, offset } = getPagination(page, size)
  Event.findAndCountAll({
    where: condition,
    limit,
    offset,
    include: [{
      model: Tag,
      required: true,
      through: {
        where: conditionTag
      }
    },
    {
      model: SubCategory,
      include: [{
        model: Category,
        where: conditionCategory
      }]
    }]
  })
    .then(data => {
      const response = getPagingData(data, page, limit)
      res.send({ ...response, success: true })
    })
}
const deleteEvent = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  }
  try {
    Event.findOne({
      where: {
        idEvent: req.params.id
      },
      include: [{
        model: Tag
      }, {
        model: SubCategory
        // specifies how we want to be able to access our joined rows on the returned data
      }
        // specifies how we want to be able to access our joined rows on the returned data
      ]
    }).then(event1 => {
      if (!event1) {
        return res.status(404).json({
          errors: ['event dont exist'],
          success: false,
          message: 'event dont exist'
        })
      }
      event1.removeTags(event1.Tags)
      event1.removeSubCategories(event1.SubCategories)
      event1.destroy().then((event) => {
        return res.send({ success: true, message: 'event added success', data: event })
      })
    })
  } catch (err) {
    return res.status(500).json({
      errors: [err],
      success: false,
      message: 'process err'
    })
  }
}
const updateImageTicket = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  }
  if (req.files == null) {
    return res.status(422).json({
      errors: ['all files are required'],
      success: false,
      message: 'all files are required'
    })
  }
  if (!req.files.image) {
    return res.status(422).json({
      errors: ['All files are required'],
      success: false,
      message: 'All files are required'
    })
  }
  try {
    Event.findOne({
      where: {
        idEvent: req.params.id
      },
      include: [{
        model: Tag
      }, {
        model: SubCategory
        // specifies how we want to be able to access our joined rows on the returned data
      }
        // specifies how we want to be able to access our joined rows on the returned data
      ]
    }).then(event1 => {
      if (!event1) {
        return res.status(404).json({
          errors: ['event dont exist'],
          success: false,
          message: 'event dont exist'
        })
      }
      if (req.body.imageType === 'outherImage') {
        const imageUrl = event1.outherImage
        try {
          fs.unlinkSync('./Upload' + imageUrl.split('/Upload')[1])
          const url = '/Upload/outherImage/' + Date.now().toString().trim() + '.' + req.files.image.mimetype.split('/')[1]
          req.files.image.mv(
            '.' + url
          )
          event1.outherImage = 'http://localhost:5002' + url
          event1.save().then((event1) => {
            return res.status(500).json({
              message: 'update successfully',
              success: true,
              data: event1
            })
          })
        } catch (err) {
          return res.status(500).json({
            errors: [err],
            success: false,
            message: 'process err'
          })
        }
      } else if (req.body.imageType === 'ticketImage') {
        const imageUrl = event1.ticketImage
        try {
          fs.unlinkSync('./Upload' + imageUrl.split('/Upload')[1])
          const url = '/Upload/ticketImage/' + Date.now().toString().trim() + '.' + req.files.image.mimetype.split('/')[1]
          req.files.image.mv(
            '.' + url
          )
          event1.ticketImage = 'http://localhost:5002' + url
          event1.save().then((event1) => {
            return res.status(500).json({
              message: 'update successfully',
              success: true,
              data: event1
            })
          })
        } catch (err) {
          return res.status(500).json({
            errors: [err],
            success: false,
            message: 'process err'
          })
        }
      } else {
        const imageUrl = event1.eventImage
        try {
          fs.unlinkSync('./Upload' + imageUrl.split('/Upload')[1])
          const url = '/Upload/eventImage/' + Date.now().toString().trim() + '.' + req.files.image.mimetype.split('/')[1]
          req.files.image.mv(
            '.' + url
          )
          event1.eventImage = 'http://localhost:5002' + url
          event1.save().then((event1) => {
            return res.status(500).json({
              message: 'update successfully',
              success: true,
              data: event1
            })
          })
        } catch (err) {
          return res.status(500).json({
            errors: [err],
            success: false,
            message: 'process err'
          })
        }
      }
    })
  } catch (err) {
    return res.status(500).json({
      errors: [err],
      success: false,
      message: 'process err'
    })
  }
}
const deleteTag = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  }
  try {
    const [result] = await sequelize.query('delete from event_has_tag where EventIdEvent = ? and TagName = ?',
      { replacements: [req.params.id, req.body.name] })
    if (result.affectedRows === 0) {
      return res.status(404).json({ errors: ['tags dont exists'], success: false, message: ['tags d"ont exist '] })
    }
    return res.status(200).json({ data: null, success: true, message: ['tags delete successfuly'] })
  } catch (err) {
    return res.status(500).json({
      errors: [err],
      success: false,
      message: 'process err'
    })
  }
}
const deleteSubcategory = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  }
  try {
    const [result] = await sequelize.query('delete from event_has_subcategory where EventIdEvent = ? and SubCategoryIdSubCategory = ?',
      { replacements: [req.params.id, req.body.idSubCategory] })
    if (result.affectedRows === 0) {
      return res.status(404).json({ errors: ['Subcategory  dont exists'], success: false, message: ['Subcategory  d"ont exist '] })
    }
    return res.status(200).json({ data: null, success: true, message: ['Subcategory delete successfuly'] })
  } catch (err) {
    return res.status(500).json({
      errors: [err],
      success: false,
      message: 'process err'
    })
  }
}
const addTagToEvent = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  }
  try {
    Event.findOne({
      where: {
        idEvent: req.params.id
      }
    }).then((event) => {
      if (!event) {
        return res.status(404).json({
          errors: ['event dont exist'],
          success: false,
          message: 'event dont exist'
        })
      }
      Tag.findOrCreate({
        where: {
          name: req.body.name
        },
        defaults: {
          name: req.body.name
        }
      }).then(async (tag) => {
        try {
          const [result, metadata] = await sequelize.query('insert event_has_tag values( ? , ? )',
            { replacements: [req.params.id, req.body.name] })
          console.log(metadata)
          if (result.affectedRows === 0) {
            return res.status(409).json({ errors: ['tag already exist'], success: false, message: ['tag already exist'] })
          }
          return res.status(200).json({ data: null, success: true, message: ['Tag added successfuly'] })
        } catch (err) {
          return res.status(409).json({ errors: ['tag already exist'], success: false, message: ['tag already exist'] })
        }
      })
    })
  } catch (err) {
    return res.status(500).json({
      errors: [err],
      success: false,
      message: 'process err'
    })
  }
}
const addSubCategory = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  }
  try {
    Event.findOne({
      where: {
        idEvent: req.params.id
      }
    }).then((event) => {
      if (!event) {
        return res.status(404).json({
          errors: ['event dont exist'],
          success: false,
          message: 'event dont exist'
        })
      }
      SubCategory.findOne({
        where: {
          idSubCategory: req.body.idSubCategory
        }
      }).then(async (subCategory) => {
        if (!subCategory) {
          return res.status(404).json({ data: null, success: true, message: ['SubCategory not found'] })
        }
        try {
          const [result, metadata] = await sequelize.query('insert event_has_subcategory values( ? , ? )',
            { replacements: [req.params.id, req.body.idSubCategory] })
          console.log(metadata)
          if (result.affectedRows === 0) {
            return res.status(409).json({ errors: ['subCategory already exist'], success: false, message: ['subCategory already exist'] })
          }
          return res.status(200).json({ data: null, success: true, message: ['Tag added successfuly'] })
        } catch (err) {
          return res.status(409).json({ errors: ['subCategory  alredy exist '], success: false, message: ['subCategory already exist'] })
        }
      })
    })
  } catch (err) {
    return res.status(500).json({
      errors: [err],
      success: false,
      message: 'process err'
    })
  }
}
const patchEvent = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  }
  try {
    Event.findOne({
      where: {
        idEvent: req.params.id
      }
    }).then(event1 => {
      if (!event1) {
        return res.status(404).json({
          errors: ['event dont exist'],
          success: false,
          message: 'event dont exist'
        })
      }
      event1.name = req.body.name ?? event1.name
      event1.description = req.body.description ?? event1.description
      event1.organiser = req.body.organiser ?? event1.organiser
      event1.startDate = req.body.startDate ?? event1.startDate
      event1.endDate = req.body.endDate ?? event1.endDate
      event1.address = req.body.name ?? event1.address
      event1.externalUrls = req.body.externalUrls ?? event1.externalUrls
      event1.ticketNb = req.body.ticketNb ?? event1.ticketNb
      event1.save().then((event) => {
        return res.status(200).json({
          data: event,
          success: true,
          message: 'event updated successfully'
        })
      })
    })
  } catch (err) {
  }
}
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: events } = data
  const currentPage = page ? +page : 0
  const totalPages = Math.ceil(totalItems / limit)
  return { totalItems, events, totalPages, currentPage }
}
const getPagination = (page, size) => {
  const limit = size ? +size : 3
  const offset = page ? page * limit : 0
  return { limit, offset }
}
module.exports = { addEvent, getAllEvents, deleteEvent, deleteTag, deleteSubcategory, addTagToEvent, addSubCategory, patchEvent, updateImageTicket }