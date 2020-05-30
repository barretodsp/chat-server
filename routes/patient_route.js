const controller = require('../controllers/patient_controller');
// const validateToken = require('../utils').validateToken;

module.exports = (router) => {
  router.route('/patient/add')
    .post(controller.add);
};