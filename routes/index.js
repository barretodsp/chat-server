
const auth = require('./auth_route')
const medical = require('./medical_route')
const patient = require('./patient_route')


module.exports = (router) => {
  auth(router)
  medical(router)
  patient(router)
  return router
}