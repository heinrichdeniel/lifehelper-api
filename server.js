var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('./middlewares/cors');
var debug = require('debug')('API:server');

var auth = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors);

app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.listen(8080, function () {
    debug('API container started on port ' + 8080);
});

module.exports = app;
