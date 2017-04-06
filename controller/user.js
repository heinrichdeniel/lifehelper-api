var User   = require('../database').User;
var Project   = require('../database').Project;
var UserTask   = require('../database').UserTask;
var Task   = require('../database').Task;
var sequelize   = require('../database').sequelize;

var generateToken = require('../utils/generateToken');       //this function return value will be the token returned to the client
var addInitialProjects = require('../utils/addInitialProjects');

exports.login = function(req,res){
    if (!req.body.email || !req.body.password){
        res.status(400).json({success: false, message: "Email address or/and password missing!"});
        return;
    }
    User.findOne({where:{email : req.body.email}}).then(function(user){
        if (!user || (user.dataValues.password != req.body.password.toString('base64'))){                 //if the username or password is invalid
            res.json({ success: false, message: 'Wrong email address or password!'});
        }
        else {               //in case of successfully login
            var token = generateToken(user.dataValues.id, user.dataValues.email);

            res.json({                      //response with status 200
                success: true,
                message: 'Enjoy your token!',
                user: user,
                token: token
            });
        }
    })
}

exports.registration = function(req,res){
    if (!req.body.email || !req.body.password || !req.body.username){
        res.status(400).json({success: false, message: "Name, email address or/and password missing!"});
        return;
    }
    User.findOne({where:{email : req.body.email}}).then(function(user){
        if (user ){                 //if the email exists in the database
            res.json({ success: false, message: 'Email is already in use'});
        }
        else {
            User.create({username: req.body.username, email: req.body.email, password: req.body.password.toString('base64')})
                .then(function(user2) {
                    var token = generateToken(user2.dataValues.id, user2.dataValues.email);
                    addInitialProjects(user2.dataValues.id).then (function(){
                        res.json({                      //response with status 200
                            success: true,
                            message: 'Enjoy your token!',
                            user: user2,
                            token: token
                        });
                    })
                })
                .catch(function(error){
                    res.json({
                        success: false,
                        message: error
                    });
                })
        }
    })
}

exports.loginFacebook = function(req,res){
    if (!req.body.facebook_id) {
        res.status(400).json({success: false, message: 'Facebook_id missing in the body of the request'});
        return;
    }
    User.findOne({where:{$or: [{facebook_id : req.body.facebook_id}, {email : req.body.email}]}}).then(function(user){
        if (!user ){                 //if the user not exists in the database
            User.create({ facebook_id:  req.body.facebook_id, username: req.body.name, email: req.body.email, photo_url: req.body.photo_url })
                .then(function(user2) {
                    var token = generateToken(user2.dataValues.id, user2.dataValues.email);
                    addInitialProjects(user2.dataValues.id).then (function(){

                        res.json({                      //response with status 200
                            success: true,
                            message: 'Enjoy your token!',
                            user: user2,
                            token: token
                        });
                    })
                })
                .catch(function(error){
                    res.json({
                        success: false,
                        message: error
                    });
                })
        }
        else {
            if (!user.dataValues.facebook_id){  //if the user not logged in with fb until now
                user.updateAttributes({
                    facebook_id: req.body.facebook_id
                });
            }
            var token = generateToken(user.dataValues.id, user.dataValues.email);

            res.json({                      //response with status 200
                success: true,
                message: 'Enjoy your token!',
                user: user,
                token: token
            });
        }
    })
};


exports.loginGoogle = function(req,res){
    if (!req.body.google_id) {
        res.status(400).json({success: false, message: 'Google_id missing in the body of the request'});
        return;
    }
    User.findOne({where:{$or: [{google_id : req.body.google_id}, {email : req.body.email}]}}).then(function(user){
        if (!user ){                 //if the user not exists in the database
            User.create({ google_id:  req.body.google_id, username: req.body.name, email: req.body.email, photo_url: req.body.photo_url })
                .then(function(user2) {
                    var token = generateToken(user2.dataValues.id, user2.dataValues.email);
                    addInitialProjects(user2.dataValues.id).then (function(){
                        res.json({                      //response with status 200
                            success: true,
                            message: 'Enjoy your token!',
                            user: user2,
                            token: token
                        });
                    })
                })
                .catch(function(error){
                    res.json({
                        success: false,
                        message: error
                    });
                })
        }
        else {
            if (!user.dataValues.google_id){  //if the user not logged in with fb until now
                user.updateAttributes({
                    google_id: req.body.google_id
                });
            }
            var token = generateToken(user.dataValues.id, user.dataValues.email);

            res.json({                      //response with status 200
                success: true,
                message: 'Enjoy your token!',
                user: user,
                token: token
            });
        }
    })
}

exports.getProfile = function(req,res){
    User.findOne({where:{id: req.user.id}}).then(function(user){
        if (!user ){                 //if the user not exists in the database
            res.json({
                success: false,
                message: "User not exists!"
            });
        }
        else {
            res.json({                      //response with status 200
                success: true,
                user: user
            });
        }
    })
}

exports.updateGeneralSettings = function(req,res){
    User.findOne({                      //get user by id
        where: {id: req.user.id}
    })
        .then(function(user) {
            var newUser = {
                language: req.body.language
            }
            if (req.body.dateFormat){
                newUser['dateFormat'] = req.body.dateFormat;
            }
            if (req.body.timeFormat){
                newUser['timeFormat'] = req.body.timeFormat;
            }
            user.updateAttributes(newUser).then (function () {
                res.json({                      //response with status 200
                    success: true,
                    user: user
                });
            });
        });
}

exports.updateAccountSettings = function(req,res){
    User.findOne({                      //    check if the email already exists in the database
        where: {email: req.body.email, id: {$ne :req.user.id}}
    })
        .then(function(exists) {
            if (exists){
                res.json({
                    success: false,
                    message: "Email already in use!"
                });
            }
            else{
                User.findOne({                      //if not then get user by id
                    where: {id: req.user.id}
                })
                    .then(function(user) {
                        var newUser = {
                            username: req.body.username,
                            email: req.body.email,
                        };
                        if (req.body.newPassword){
                            newUser['password'] = req.body.newPassword;
                        }
                        user.updateAttributes( newUser ).then (function () {
                            res.json({                      //response with status 200
                                success: true,
                                user: user
                            });
                        });
                    });
            }
        });
}

exports.getListByFilter = function(req,res){
    User.findAll({
        attributes: ['id', 'username', 'email', 'photo_url'],
        include: {
            model: Task, attributes: ['id'], through: {
                attributes: []
            }
        },
        where: {
            $or:[
                sequelize.where(sequelize.fn('lower', sequelize.col('email')), {$like: sequelize.fn('lower', req.query.filter+"%")}),
                sequelize.where(sequelize.fn('lower', sequelize.col('username')), {$like: sequelize.fn('lower', req.query.filter+"%")}),
            ],
            id: {$ne: req.user.id}
        }
    })
        .then(function(users) {
            res.json({                      //response with status 200
                success: true,
                users: users,
                taskId: req.query.taskId
            });
        });
}

exports.getCollaborators = function(req,res){       //return collaborators of task or project
    User.findAll({
        attributes: ['id', 'username', 'email', 'photo_url'],
        include: {
            model: Task, attributes: ['id','owner'], where: {id: req.query.taskId},through: {
                attributes: ['shareStatus','sharedBy']
            }
        },
        where: {
            id: {$ne: req.user.id}
        }
    })
        .then(function(users) {
            res.json({                      //response with status 200
                success: true,
                users: users
            });
        });
}

exports.getNotifications = function(req,res){       //return the tasks where the user got share request
    User.findOne({
        where: {id: req.user.id}
    })
        .then(function (user) {
            if (user.notifications){
                user.updateAttributes({             //the user now have notifications
                    notifications: false
                });
            }

        });
    Task.findAll({
        include: [
            {
                model: UserTask,
                attributes: ['shareStatus'],
                where: {UserId: req.user.id, shareStatus: "pending"},
                include: {
                    model: User,
                    as: 'sharedUser'
                }
            },
            {
                model: Project,
                attributes: ['name'],
            }
        ],
    })
        .then(function(tasks) {
            res.json({                      //response with status 200
                success: true,
                notifications: {
                    tasks: tasks
                }
            });
        });
}