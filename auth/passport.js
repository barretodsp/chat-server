const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const config = require("../config");
const medicalController = require('../controllers/medical_controller');
const pg = require("pg");

var dbcfg = {
  database: process.env.DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};
const pool = new pg.Pool(dbcfg);
var dbConn = null;
(async function() {
  dbConn = await pool.connect()
})();

const getToken = req => {
  let token = req.get('Authorization');
  console.log("Token:");
  console.log(token);
  return token;
}

passport.use(new JwtStrategy({
  jwtFromRequest: getToken,
  secretOrKey: config.JWT_SECRET,
  passReqToCallback: true
}, async (req, payload, done) => {
  console.log("JwtStrategy");
  try {
    console.log('Payload', payload)
    const user = await medicalController.getById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    req.user = user;
    done(null, user);
  } 
  catch(error) {
    done(error, false);
  }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField : 'password'
}, async (email, password, done) => {
  try {
    console.log("LocalStrategy");
    console.log("1");
    const medical = await medicalController.getByEmail(email);    
    console.log('USER LOCAL STR', medical);
    console.log("2");
    if (!medical) {
      console.log("getLocalUserByEmail Ok");
      return done(null, false);
    }
    console.log("3");

    const cryptedPassword = await medicalController.getCryptedPassword(medical.medical_id);
    
    console.log("cryptedPassword");
    console.log(cryptedPassword);

    const isMatch = await medicalController.checkPassword(password, cryptedPassword);
    if (!isMatch) {
      console.log("getLocalUserByEmail Pass Ok False");
      return done(null, false);
    }

    console.log("getLocalUserByEmail Pass USER");
    done(null, medical);
  } 
  catch(error) {
    console.log(error);
    done(error, false);
  }
}));
