const controller = require('../controllers/medical_controller');
const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

module.exports = (router) => {
  router.route('/medical/add')
    .post(controller.add)
  router.route('/medical/get')
    .post(passportJWT, controller.get);
};