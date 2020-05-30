const controller = require('../controllers/medical_controller');
// const validateToken = require('../utils').validateToken;

module.exports = (router) => {
  router.route('/medical/add')
    .post(controller.add);
};