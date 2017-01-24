var Sequelize = require('Sequelize');
var sequelize = require('../index').sequelize;

var User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: Sequelize.STRING,
    google_id: {
        type: Sequelize.STRING,
        unique: true
    },
    facebook_id: {
        type: Sequelize.STRING,
        unique: true
    },
    photo_url: Sequelize.STRING,
    deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }

});
/*INSERT INTO `users`(`id`, `username`, `email`, `password`) VALUES (1,'deniel','heinrichdeniel@yahoo.com','password')*/
exports.User = User;