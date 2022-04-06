const { validationResult } = require('express-validator/check')
const { SubCategory, Tag, Event } = require('../models')
const addEvent = (req, res, next) => {
  try {
    console.log(req.body)
    console.log(req.fields)
    const tags = req.body.tags ?? []
    const subcategories = req.body.subCategory ?? []
    if (!Array.isArray(tags) || !Array.isArray(subcategories)) {
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
        const urlOutherImage = '/Upload/outherImage' + Date.now().toString().trim() + req.files.outherImage.name.trim()
        const urlTicketImage = '/Upload/ticketImage' + Date.now().toString().trim() + req.files.ticketImage.name.trim()
        const urlEventImage = '/Upload/eventImage' + Date.now().toString().trim() + req.files.eventImage.name.trim()
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
  Event.findAll({
    include: [{
      model: Tag
    }, {
      model: SubCategory
      // specifies how we want to be able to access our joined rows on the returned data
    }
      // specifies how we want to be able to access our joined rows on the returned data
    ]
  }).then(events => {
    return res.send({ data: events, success: true, message: 'all events are here' })
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
const addTagToEvent = (req, res) => {
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
      }]
    }).then(event1 => {
      if (!event1) {
        return res.status(404).json({
          errors: ['event dont exist'],
          success: false,
          message: 'event dont exist'
        })
      }
      console.log(event1)
      const find = event1.Tags.find(element => element.name === req.body.name)
      if (find) {
        return res.send({ success: false, message: 'tags already exist' })
      }
      Event.findOne({
        where: {
          idEvent: req.params.id
        },
        include: [{ model: Tag }]
      }).then((event) => {
        event.getTags({ where: { name: req.body.name } }).then((tags) => {
          if (tags) {
            return res.send({ data: event1, success: false, message: 'tags already exist' })
          }
        })
        Tag.findOrCreate({
          where: { name: req.body.name },
          defaults: {
            name: req.body.name
          }
        }).then((tag) => {
          event1.addTags(tag).then((event) => {
            return res.send({ data: event1, success: true, message: 'event add success' })
          })
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
module.exports = { addEvent, getAllEvents, deleteEvent, addTagToEvent }
