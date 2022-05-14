/* eslint-disable prefer-const */
const { validationResult } = require('express-validator/check')
const { SubCategory, Tag, Event, sequelize, Category } = require('../models')
const Op = require('Sequelize').Op
const upload = require('../util/upload')
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
    console.log(subcategories)
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
        upload(req.files.outherImage.data).then((outherImageUrl) => {
          upload(req.files.ticketImage.data).then((ticketImageUrl) => {
            upload(req.files.eventImage.data).then((eventImageUrl) => {
              Event.create({
                name: req.body.name,
                description: req.body.description,
                organiser: req.body.organiser,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                address: req.body.address,
                price: req.body.price,
                justForWomen: req.body.justForWomen,
                eventImage: eventImageUrl,
                ticketImage: ticketImageUrl,
                outherImage: outherImageUrl,
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
const getAllEvents = async (req, res) => {
  const { page, size, search, tag, category } = req.query
  const condition = !search ? null : { [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }, { organiser: { [Op.like]: `%${search}%` } }] }
  const conditionTag = !tag ? null : { tagName: { [Op.like]: `%${tag}%` } }
  const conditionCategory = !category ? null : { name: { [Op.eq]: `${category}` } }
  const { limit, offset } = getPagination(page, size)
  const total = await Event.count({ where: condition, limit: limit, offset: offset })
  Event.findAndCountAll({
    where: condition,
    order: sequelize.random(),
    limit,
    offset,
    include: [{
      model: Tag,
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
      data.count = total
      const response = getPagingData(data, page, limit)
      res.send({ ...response, success: true })
    })
}
async function getByIdEvent (req, res) {
  try {
    const id = parseInt(req.params.id)
    const event = await Event.findByPk(id)
    if (event !== null) {
      return res.status(200).send({ data: event, success: true })
    } else {
      res.status(422).send({ success: false, message: 'Event Not found!' })
    }
  } catch (error) {
    res.status(500).send({ errors: error.toString(), success: false, message: 'processing err' })
  }
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
        try {
          upload(req.files.image.data).then((url) => {
            event1.outherImage = url
            event1.save().then((event1) => {
              return res.status(200).json({
                message: 'update successfully',
                success: true,
                data: event1
              })
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
        try {
          upload(req.files.image.data).then((url) => {
            event1.ticketImage = url
            event1.save().then((event1) => {
              return res.status(200).json({
                message: 'update successfully',
                success: true,
                data: event1
              })
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
        try {
          upload(req.files.image.data).then((url) => {
            event1.eventImage = url
            event1.save().then((event1) => {
              return res.status(200).json({
                message: 'update successfully',
                success: true,
                data: event1
              })
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
      { replacements: [req.params.id, req.params.name] })
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
      { replacements: [req.params.id, req.params.idSubCategory] })
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
  console.log(req.body)
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
        const [object, created] = tag
        console.log(created)
        try {
          event.addTag(object).then((event) => {
            if (!event) {
              return res.status(409).json({ message: 'tag already exist', success: false, data: event })
            }
            return res.status(200).json({ message: 'tag added successfully', success: true, data: event })
          })
        } catch (err) {
          return res.status(409).json({ errors: [err], success: false, message: ['tag already exist'] })
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
          subCategory.addEvent(event).then((event) => {
            if (!event) {
              return res.status(409).json({ errors: ['subCategory  alredy exist '], success: false, message: ['subCategory already exist'] })
            }
            return res.status(200).json({ data: event, success: true, message: ['subCategory added successfuly'] })
          })
        } catch (err) {
          return res.status(409).json({ errors: [err], success: false, message: 'err' })
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
      event1.price = req.body.price ?? event1.price
      event1.justForWomen = req.body.justForWomen ?? event1.justForWomen
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
  const totalPagesFalse = Math.ceil(totalItems / limit)
  console.log(Math.ceil(totalItems / limit))
  const totalpages = totalPagesFalse === 0 ? totalPagesFalse : totalPagesFalse
  return { totalItems, events, totalpages, currentPage }
}
const getPagination = (page, size) => {
  const limit = size ? +size : 3
  const offset = page ? page * limit : 0
  return { limit, offset }
}
module.exports = { addEvent, getAllEvents, getByIdEvent, deleteEvent, deleteTag, deleteSubcategory, addTagToEvent, addSubCategory, patchEvent, updateImageTicket }
