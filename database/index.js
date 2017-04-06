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
    Project:   sequelize.import('./models/project'),

    UserTask: sequelize.define('UserTask',{     //n-m relation table between User and Task
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        shareStatus: {
            type: Sequelize.STRING,
            defaultValue: "nothing"
        }
    }),

    UserProject: sequelize.define('UserProject',{       //n-m relation table between Project and User
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        deleted:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    })
};

db.User.belongsToMany(db.Task,  { through: db.UserTask, foreignKey: "UserId" });
db.Task.belongsToMany(db.User, { through: db.UserTask});

db.Task.hasMany(db.UserTask);
db.User.hasOne(db.UserTask);
db.UserTask.belongsTo(db.User,  {foreignKey: 'sharedBy', as: 'sharedUser'});
db.UserTask.belongsTo(db.Task);


db.User.belongsToMany(db.Project, { through: db.UserProject });
db.Project.belongsToMany(db.User, { through: db.UserProject });

db.Project.hasMany(db.Task, { onDelete: 'cascade' });
db.Task.belongsTo(db.Project);

module.exports = db;