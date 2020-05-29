const controller = require('../controllers/auth_controller');
// const validateToken = require('../utils').validateToken;

module.exports = (router) => {
  router.route('/auth/medicalLogin')
    .post(controller.medical_login);
  router.route('/auth/add')
    .post(controller.add);
};