var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('./middlewares/cors');
var debug = require('debug')('node-sequelize-postgresql');
var db = require('./database');
var auth = require('./routes/auth');
var tasks = require('./routes/tasks');
var projects = require('./routes/projects');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors);

app.use('/auth', auth);
app.use('/tasks', tasks);
app.use('/projects', projects);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


var PORT = process.env.PORT || 5000;

db.sequelize.sync().then(function() {
    app.listen(PORT, function () {
        debug('API container started on port ' + PORT);
    });
});

module.exports = app;
