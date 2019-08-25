var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var http = require('http')
var hbs = require('express-hbs')
const logger = require('../common/logger')
const config = require('config')


module.exports = function (controller) {

  controller.webserver.use(function (req, res, next) {
    req.rawBody = ''

    req.on('data', function (chunk) {
      req.rawBody += chunk
    })

    next()
  })
  controller.webserver.use(cookieParser())
  controller.webserver.use(bodyParser.json())
  controller.webserver.use(bodyParser.urlencoded({ extended: true }))

  // set up handlebars ready for tabs
  controller.webserver.engine('hbs', hbs.express4({ partialsDir: __dirname + '/../views/partials' }))
  controller.webserver.set('view engine', 'hbs')
  controller.webserver.set('views', __dirname + '/../views/')

  controller.webserver.use(config.get('API_PREFIX'), express.static('public'))




  // import all the pre-defined routes that are present in /components/routes
  var normalizedPath = require('path').join(__dirname, 'routes')
  require('fs').readdirSync(normalizedPath).forEach(function (file) {
    require('./routes/' + file)(controller)
  })


  return controller.webserver

}
