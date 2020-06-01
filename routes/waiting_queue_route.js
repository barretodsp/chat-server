const controller = require('../controllers/waiting_queue_controller');
const passport = require('passport');
const passportConf = require('../auth/passport');
const passportSignIn = passport.authenticate('local', { session: false });
const passportJWT = passport.authenticate('jwt', { session: false });


module.exports = (router) => {
  router.route('/waitingQueue/getAll')
    .post(passportJWT, controller.getAll)
};