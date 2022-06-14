// const { sequelize } = require('./models')
// const createError = require("http-errors")
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const indexRouter = require('./routes/indexRoutes')
const fileUpload = require('express-fileupload')
const rabbitmq = require('./utils')
const eurekaHelper = require('./eurekaHelper/eurekaHelper.js')
// const usersRouter = require("./routes/users");
// const Account = require("./models/Account");
// const User = require("./models/User");

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('Upload', express.static(__dirname))
app.use(
  fileUpload({
    createParentPath: true,
    safeFileNames: true
  })
)
app.use(express.static('Upload'))
const bodyParser = require('body-parser')
app.use('/api', indexRouter)
app.get('/Upload/*:filename*', (req, res) => {
  console.log(__dirname)
  res.sendFile(
    path.join(__dirname, '../Upload', req.path.substring(8, req.path.length))
  )
})
// sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(function () {
//   sequelize.sync({ force: false, alter: true })
// })

app.use(bodyParser.urlencoded({ extended: true }))
rabbitmq.CreatChannel()
eurekaHelper.registerWithEureka('service-event', process.env.PORT)
// parse application/json
app.use(bodyParser.json())
console.log(process.env.PORT)
app.listen(process.env.PORT)
module.exports = app
console.log('server start on port 5002')
