
const auth = require('./auth_route')
const medical = require('./medical_route')
const patient = require('./patient_route')
const waiting = require('./waiting_queue_route')


module.exports = (router) => {
  auth(router)
  medical(router)
  patient(router)
  waiting(router)
  return router
}