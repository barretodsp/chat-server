const controller = require('../controllers/waiting_queue_controller');
const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });


module.exports = (router) => {
  router.route('/waitingQueue/getAll')
    .post(passportJWT, controller.getAll)
};