
const auth = require('./auth_route')

module.exports = (router) => {
  auth(router)
  return router
}