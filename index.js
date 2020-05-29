
const result = require("dotenv").config()
if (result.error) {
  throw result.error
}
console.log(result.parsed);

const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const routes = require('./routes/index')

//express config
var app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
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


module.exports = app;