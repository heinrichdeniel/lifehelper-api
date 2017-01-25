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

if (!global.hasOwnProperty('db')) {     //ha mar letre volt hozva a kapcsolat akkor nem keszit ujjat
    var Sequelize = require('sequelize');
    var database = require('../config').database;

    if (process.env.HEROKU_POSTGRESQL_BRONZE_URL) {
        // hoston valo futtatas eseten
        sequelize = new Sequelize(process.env.HEROKU_POSTGRESQL_BRONZE_URL, {
            dialect:  'postgres',
            protocol: 'postgres',
            port:     match[4],
            host:     match[3],
            logging:  true //false
        })
    } else {
        // lokalis futtatas eseten
        sequelize = new Sequelize(database.name, database.user, database.password, {
            host: database.host,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        });
    }

    global.db = {
        Sequelize: Sequelize,
        sequelize: sequelize,
        User:      sequelize.import('./models/user')
        // add your other models here
    };

    /*
     Associations can be defined here. E.g. like this:
     global.db.User.hasMany(global.db.SomethingElse)
     */
}

module.exports = global.db