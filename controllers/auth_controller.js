
const pg = require("pg");
const cfg = require("../config");
const token_processor = require('../auth/token_processor');

var config = {
  database: process.env.DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};
const pool = new pg.Pool(config);

module.exports = {
  loginMedical: async (req, res, next) => {
    console.log("loginMedical", req.user);
    if (req.user) {
      const token = signToken(req.user);
      res.cookie('access_token', token, {
        httpOnly: true
      });
      res.status(200).json({
        type: "loginMedical",
        token: token,
        medical: req.user,
        auth: true
      });
    }
    else {
      res.status(200).json({
        type: "loginMedical",
        auth: false
      });
    }
  },
}