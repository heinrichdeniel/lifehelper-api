var Project   = require('../database').Project;
var User   = require('../database').User;
var UserProject   = require('../database').UserProject;
var Pusher = require('pusher');

var pusher = new Pusher({
    appId: '331677',
    key: 'c8ef916cb507629d3a96',
    secret: 'febf13ca72bd9d0e438a',
    cluster: 'eu',
    encrypted: true
});

var assignProjectToUser = require('../utils/assignProjectToUser');
var setProjectToUnshared = require('../utils/setProjectToUnshared');
var shareTasksOfProject = require('../utils/shareTasksOfProject');
var deleteTasksOfProject = require('../utils/deleteTasksOfProject');
var completeTasksOfProject = require('../utils/completeTasksOfProject');

//create or update a project
exports.create = function(req,res){
    if (req.body.id){           //if the project already exists
        Project.findOne({                      //get project by id
            where: {id: req.body.id},
            include: {model: User, attributes: [],where:{
                id: req.user.id
            }}
        })
            .then(function(project) {
                var completedAt = null;  /*the date when the task was completed*/
                if (req.body.status == 'completed'||req.body.status == 'archived'){
                    completedAt = new Date();
                    completeTasksOfProject(req.body.id, req.body.status, completedAt);
                }
                project.updateAttributes({             //updating attributes
                    name: req.body.name,
                    status: req.body.status,
                    completedAt: completedAt
                });
                res.json({                      //response with status 200
                    success: true,
                    message: 'Project updated!',
                    project: project
                });

            })
    }
    else {          //creating the new project if it not exists
        Project.findOne({                      //get project by id
            where: {name: req.body.name},
            include: {model: User,where:{
                id: req.user.id
            }}
        })
        .then(function(project) {
            if (project) { //if a project with this name already exists
                res.json({
                    success: false,
                    message: "Already exists a project with the name: "+ project.name
                });
            }
            else{
                Project.create({
                    name: req.body.name,
                    owner: req.user.id
                })
                    .then(function (project) {
                        assignProjectToUser(project, req.user.id);
                        res.json({                      //response with status 200
                            success: true,
                            message: 'Project added to database!',
                            project: project
                        });
                    })
                    .catch(function (error) {
                        res.json({
                            success: false,
                            message: error
                        });
                    })
            }
        });
    }

};

//get the list of projects
exports.getList = function(req,res){
    Project.findAndCountAll({
        include: {
            model: UserProject,
            where: {
                UserId: req.user.id,
                $and: [
                    {shareStatus: {$ne: "pending"}},
                    {shareStatus: {$ne: "declined"}},
                    {shareStatus: {$ne: "deleted"}}
                ]

            }
        },

        order: [
            ['name', 'ASC']
        ]
    })
        .then(function(projects) {
            res.json({                      //response with status 200
                success: true,
                projects: projects.rows
            });
        })
};

//delete project
exports.delete = function(req,res){
    UserProject.destroy({                                               //delete the project
        where: {UserId: req.user.id, ProjectId: req.body.id}
    })
        .then(function() {
            deleteTasksOfProject(req.user.id, req.body.id)
            setProjectToUnshared(req.body.id)
            res.json({                      //response with status 200
                success: true,
                projectId: req.body.id
            });
        })
};


//if the user want to share a whole project with other user(s)
exports.shareProject = function(req,res){
    req.body.users.map( function(user) {
        UserProject.findOne({
            where: {UserId: user.value, ProjectId: req.body.project.id}
        })
            .then(function(userProject){
                pusher.trigger('notifications', user.value.toString(), {
                    "message": "New notification!"
                });
                if (!userProject){
                    UserProject.create({
                        UserId: user.value,
                        ProjectId: req.body.project.id,
                        shareStatus: "pending",
                        sharedBy: req.user.id
                    }).catch(function () {
                        res.json({                      //response with status 200
                            success: false
                        });
                    });
                }
                else{
                    userProject.updateAttributes({
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
    Project.findOne({
        where: {id: req.body.project.id}
    })
        .then(function(project) {
            project.updateAttributes({             //updating attributes
                shared: true
            });
            res.json({                      //response with status 200
                success: true,
                project: project
            });
        })
};

//if the user accepted the shared project
exports.acceptShare = function(req,res){
    UserProject.findOne({
        where: {UserId: req.user.id, ProjectId: req.body.projectId}
    })
        .then(function(userProject){
            userProject.updateAttributes({
                shareStatus: "accepted"
            }).then(function() {
                shareTasksOfProject(req.user.id, req.body.projectId, userProject.sharedBy);
                res.json({
                    success: true
                });
            });
        });
};

//if the user declined the shared project
exports.declineShare = function(req,res){
    UserProject.findOne({
        where: {UserId: req.user.id, ProjectId: req.body.projectId}
    })
        .then(function(userProject){
            userProject.updateAttributes({
                shareStatus: "declined"
            }).then(function() {
                setProjectToUnshared(req.body.projectId)
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

    UserProject.findOne({
        where: {UserId: req.body.userId, ProjectId: req.body.projectId}
    })
        .then(function (userProject) {
            userProject.updateAttributes({
                shareStatus: "deleted"
            })
                .then(function(){
                    setProjectToUnshared(req.body.projectId)
                    res.json({
                        success: true
                    });
                });
        })
};
