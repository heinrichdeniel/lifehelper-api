var Sequelize = require('Sequelize');
var database = require('../config').database;

var sequelize = new Sequelize(database.name, database.user, database.password, {
    host: database.host,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

exports.sequelize = sequelize;