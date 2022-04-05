const { sequelize } = require('./models')
// const createError = require("http-errors")
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/indexRoutes')
// const usersRouter = require("./routes/users");
// const Account = require("./models/Account");
// const User = require("./models/User");

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.static('Upload'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', indexRouter)

sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(function () {
  sequelize.sync({ force: false, alter: true })
})

app.listen(5002)

module.exports = app
console.log('server start on port 5001')