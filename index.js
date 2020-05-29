const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index')

var app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.use('/api/v1', routes(router));

const server = app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


module.exports = app;