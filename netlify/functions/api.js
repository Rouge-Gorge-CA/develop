const serverless = require('serverless-http')
const app = require('../../api/app')

const handler = serverless(app)

module.exports.handler = async (event, context) => {
  // Netlify passe /.netlify/functions/api/... → on réécrit en /api/...
  event.path = event.path.replace(/^\/.netlify\/functions\/api/, '/api') || '/api'
  return handler(event, context)
}
