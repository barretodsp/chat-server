
const result = require("dotenv").config()
if (result.error) {
  throw result.error
}
console.log(result.parsed);

const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index')
const passport = require("passport");


//express config
const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// passport.serializeUser(function(user, cb) {
//   cb(null, user);
// });

// passport.deserializeUser(function(obj, cb) {
//   cb(null, obj);
// });
app.use(passport.initialize());
app.use('/api/v1', routes(router));


//database config
var config = {
  database: process.env.DATABASE,
  host: process.env.DB_HOST,
  port: process.env.PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};
const pool = new pg.Pool(config);

//server up
const server = app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

const io = require('socket.io')(server);
require('./chat/consumer')(io);


module.exports = app;