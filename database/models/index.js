var Sequelize = require('Sequelize');
var sequelize = require('../index').sequelize;
var User = require('./user').User;

User.sync();

exports.User = User;