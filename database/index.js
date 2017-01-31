var database = require('../config').database;

var Sequelize = require("sequelize");
var sequelize = new Sequelize("postgres://kfpbxtlgixodfj:a161df8e9f0d23df9fc9aef8765d3456024ec236d722ef92a90596eaab4ebd5f@ec2-79-125-13-42.eu-west-1.compute.amazonaws.com:5432/d83i7i03aae4ve" ,{
    dialect: 'postgres',
    dialectOptions: {
        ssl: true
    },
    define: {
        timestamps: false
    },
    freezeTableName: true,
    pool: {
        max: 9,
        min: 0,
        idle: 10000
    }
});

var db = {
    Sequelize: Sequelize,
    sequelize: sequelize,

    User:      sequelize.import('./models/user'),
    Task:      sequelize.import('./models/task'),

    UserTask: sequelize.define('UserTask',{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    })
}


    db.User.belongsToMany(db.Task, { through: db.UserTask });
    db.Task.belongsToMany(db.User, { through: db.UserTask });


module.exports = db