const serverless = require('serverless-http')
const app = require('../../api/app')

module.exports.handler = serverless(app)
