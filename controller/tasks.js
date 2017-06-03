var Task   = require('../database').Task;
var User   = require('../database').User;
var UserTask   = require('../database').UserTask;
var Project   = require('../database').Project;
var Sequelize = require('../database').Sequelize;
var Pusher = require('pusher');
var moment = require('moment');

var pusher = new Pusher({
    appId: '331677',
    key: 'c8ef916cb507629d3a96',
    secret: 'febf13ca72bd9d0e438a',
    cluster: 'eu',
    encrypted: true
});

var assignTaskToUser = require('../utils/assignTaskToUser');
var setTaskToUnshared = require('../utils/setTaskToUnshared');
var assignTaskToCollaborators = require('../utils/assignTaskToCollaborators');
var setPriorityOfTask = require('../utils/setPriorityOfTask');

//creating a new task
exports.create = function(req,res){
    if (req.body.id){           //if the task already exists
        Task.findOne({                      //get task by id
            where: {id: req.body.id},
            include: [
                {model: User, attributes: [],where:{
                    id: req.user.id
                }},
                {model: Project}

            ]
        })
            .then(function(task) {
                var completedAt = null;  /*the date when the task was completed*/
                if (req.body.status == 'completed'||req.body.status == 'archived'){
                    completedAt = new Date();
                }
                task.updateAttributes({             //updating attributes
                    name: req.body.name,
                    description: req.body.description,
                    date: req.body.date,
                    time: req.body.time,
                    location: req.body.location,
                    lat: req.body.lat,
                    lng: req.body.lng,
                    ProjectId: req.body.ProjectId,
                    status: req.body.status,
                    completedAt: completedAt
                }).then (function (){
                    Task.findOne({                      //get task by id
                        where: {id: req.body.id},
                        include: [
                            {model: User, attributes: [],where:{
                                id: req.user.id
                            }},
                            {model: Project}

                        ]
                    }).then(function(task) {
                        res.json({                      //response with status 200
                            success: true,
                            message: 'Task updated!',
                            task: task
                        });
                    });
                })

            })
    }
    else {          //creating the new task if it not exists
        Task.create({
            name: req.body.name,
            description: req.body.description,
            date: req.body.date,
            time: req.body.time,
            location: req.body.location,
            lat: req.body.lat,
            lng: req.body.lng,
            ProjectId: req.body.ProjectId,
            owner: req.user.id

        })
            .then(function(task) {
                assignTaskToUser(task, req.user.id);

                Task.findOne({                      //get task by id
                    where: {id: task.id},
                    include: [
                        {model: Project}
                    ]
                }).then(function(task) {
                    if (task.Project && task.Project.shared){           //if the selected project is shared with other users
                        assignTaskToCollaborators(task,req.user.id);
                        task.updateAttributes({shared: true})
                    }
                    res.json({                      //response with status 200
                        success: true,
                        message: 'Task added to database!',
                        task: task
                    });
                });
            })
            .catch(function(error){
                res.json({

                    success: false,
                    message: error
                });
            })
    }

};

//get the list of tasks where completed, deleted and archived fields = false
exports.getList = function(req,res){
    Task.findAndCountAll({
        include:[
            {
                model: UserTask,
                where: {
                    UserId: req.user.id,
                    $and: [
                        {shareStatus: {$ne: "pending"}},
                        {shareStatus: {$ne: "declined"}},
                        {shareStatus: {$ne: "deleted"}}
                    ]

                }
            },
            {model: Project}
        ] ,
        where:{
            status: "pending"
        },
        order: [
            [Sequelize.col('priority', 'UserTask'), 'ASC'],
            ['date', 'ASC'],
            ['time', 'ASC']
        ]
    })
        .then(function(tasks) {
            res.json({                      //response with status 200
                success: true,
                tasks: tasks.rows
            });
        })

};

exports.getArchive = function(req,res){         //get tasks, where archived = true or completed = true
    Task.findAndCountAll({
        include:[
            {model: User, attributes: [],where:{
                id: req.user.id
            }},
            {model: Project}
        ] ,
        where:{
            status:  {$in:[ 'completed', 'archived']}
        },
        order: [
            [Sequelize.col('priority', 'UserTask'), 'ASC'],
            ['date', 'ASC'],
            ['time', 'ASC']
        ]
    })
        .then(function(tasks) {
            res.json({                      //response with status 200
                success: true,
                tasks: tasks.rows
            });
        })
};

//get task by id
exports.getTask = function(req,res){
    Task.findOne({
        where: {id: req.query.id},
        include: [
            {model: User, attributes: [],where:{
                id: req.user.id
            }},
            {model: Project}
        ]
    })
        .then(function(task) {
            if (!task){
                res.statusCode = 404;
                res.json({
                    success: false,
                    message: "No task found!"
                });
            }
            else{
                res.json({                      //response with status 200
                    success: true,
                    task: task
                });
            }

        })
};

//delete task
exports.delete = function(req,res){
    UserTask.destroy({
        where: {UserId: req.user.id, TaskId: req.body.id}
    })
        .then(function() {
            setTaskToUnshared(req.body.id);
            res.json({                      //response with status 200
                success: true
            });
        })
};

//if the user want to share a task with other user(s)
exports.shareTask = function(req,res){
    req.body.users.map( function(user) {
        UserTask.findOne({
            where: {UserId: user.value, TaskId: req.body.task.id}
        })
            .then(function(userTask){
                pusher.trigger('notifications', user.value.toString(), {
                    "message": "New notification!"
                });
                if (!userTask){
                    UserTask.create({
                        UserId: user.value,
                        TaskId: req.body.task.id,
                        shareStatus: "pending",
                        sharedBy: req.user.id
                    }).then(function (userTask2) {
                        setPriorityOfTask(user.value,userTask2);
                    })
                        .catch(function (e) {
                            res.json({
                                success: false
                            });
                        });
                }
                else{
                    userTask.updateAttributes({
                        shareStatus: "pending"
                    })
                }
            });

        User.findOne({
            where: {id: user.value}
        })
            .then(function (user) {
                if (!user.notifications){
                    user.updateAttributes({             //the user now have notifications
                        notifications: true
                    });
                }
            });
    });
    Task.findOne({
        where: {id: req.body.task.id}
    })
        .then(function(task) {
            task.updateAttributes({             //updating attributes
                shared: true
            });
            res.json({                      //response with status 200
                success: true,
                task: task
            });
        })
};

//if the user accepted the shared task
exports.acceptShare = function(req,res){
    UserTask.findOne({
        where: {UserId: req.user.id, TaskId: req.body.taskId}
    })
        .then(function(userTask){
            userTask.updateAttributes({
                shareStatus: "accepted"
            }).then(function() {
                res.json({
                    success: true
                });
            });
        });
};

//if the user declined the shared task
exports.declineShare = function(req,res){
    UserTask.findOne({
        where: {UserId: req.user.id, TaskId: req.body.taskId}
    })
        .then(function(userTask){
            userTask.updateAttributes({
                shareStatus: "declined"
            }).then(function() {
                setTaskToUnshared(req.body.taskId);
                res.json({
                    success: true
                });
            });
        });
};


//if the user want to remove the share
exports.removeShare = function(req,res){
    User.findOne({
        where: {id: req.body.userId}
    })
        .then(function (user) {
            if (!user.notifications){
                user.updateAttributes({             //the user now have notification cause he is removed
                    notifications: true
                });
            }
        });

    UserTask.findOne({
        where: {UserId: req.body.userId, TaskId: req.body.taskId}
    })
        .then(function (userTask) {
            userTask.updateAttributes({
                shareStatus: "deleted"
            })
                .then(function(){
                    setTaskToUnshared(req.body.taskId);
                    res.json({
                        success: true
                    });
                });
        })
};

exports.changeOrder = function(req,res){
    UserTask.findOne({
        where: {UserId: req.user.id, TaskId: req.body.taskId}
    })
        .then(function(userTask){
            userTask.updateAttributes({
                priority: req.body.priority
            }).then(function() {
                exports.getList(req,res);
            });
        });
};

