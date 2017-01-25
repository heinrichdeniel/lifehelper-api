var Sequelize = require('Sequelize');
var database = require('../config').database;

if (!global.hasOwnProperty('db')) {     //ha mar letre volt hozva a kapcsolat akkor nem keszit ujjat
    var Sequelize = require('sequelize');
    var database = require('../config').database;

    if (database.production.use_env_variable) {
        // hoston valo futtatas eseten
        sequelize = new Sequelize(process.env[database.production.use_env_variable], {
            dialectOptions: {
                ssl: true /* for SSL config since Heroku gives you this out of the box */
            }
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