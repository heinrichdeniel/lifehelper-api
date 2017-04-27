var Comment   = require('../database').Comment;
var Task   = require('../database').Task;
var Project   = require('../database').Project;
var User   = require('../database').User;
var UserTask   = require('../database').UserTask;
var UserProject   = require('../database').UserProject;
var sequelize   = require('../database').sequelize;
var Pusher = require('pusher');

var pusher = new Pusher({
    appId: '331677',
    key: 'c8ef916cb507629d3a96',
    secret: 'febf13ca72bd9d0e438a',
    cluster: 'eu',
    encrypted: true
});
var newCommentNotification = require('../utils/newCommentNotification');
var sendCommentTrigger = require('../utils/sendCommentTrigger');

//create or update a comment
exports.createOrUpdate = function(req,res){
    newCommentNotification(req.user.id, req.body.taskId, req.body.projectId);
    if (req.body.id){           //if the comment already exists
        Comment.findOne({                      //get comment by id
            where: {id: req.body.id}
        })
            .then(function(comment) {
                comment.updateAttributes({             //updating attributes
                    text: req.body.text
                }).then(function(){
                    sendCommentTrigger(pusher, req.body.taskId, req.body.projectId, req.user.id);
                    res.json({                      //response with status 200
                        success: true,
                        message: 'Comment updated!',
                        comment: comment
                    });
                })
            })
    }
    else {          //creating the new comment if it not exists
        Comment.create({
            text: req.body.text,
            TaskId: req.body.taskId,
            ProjectId: req.body.projectId,
            UserId: req.user.id,
            createdAt: new Date()
        })
            .then(function (comment) {
                sendCommentTrigger(pusher, req.body.taskId, req.body.projectId, req.user.id);
                res.json({                      //response with status 200
                    success: true,
                    message: 'Comment added to database!',
                    comment: comment
                });
            })
    }

};

//get the list of comments
exports.getList = function(req,res){
    Task.findAll({
        attributes:['id', 'name'],
        include: [
            {
                model: UserTask,
                attributes:['newComment'],
                where: {
                    UserId: req.user.id,
                    $and: [
                        {shareStatus: {$ne: "pending"}},
                        {shareStatus: {$ne: "declined"}},
                        {shareStatus: {$ne: "deleted"}}
                    ]
                }
            },
            {
                model: Comment,
                include: {model: User, attributes: ['id', 'username', 'photo_url']}
            }
        ],
        order: [
            [ UserTask, 'newComment', 'DESC'],
            [ 'name' , 'ASC'],
            [ Comment, 'createdAt', 'ASC']
        ]
    })
        .then(function(tasks) {                      // then get the comments fo the tasks
            Project.findAll({
                attributes:['id', 'name'],
                include: [
                    {
                        model: UserProject,
                        attributes:['newComment'],
                        where: {
                            UserId: req.user.id,
                            $and: [
                                {shareStatus: {$ne: "pending"}},
                                {shareStatus: {$ne: "declined"}},
                                {shareStatus: {$ne: "deleted"}}
                            ]
                        }
                    },
                    {
                        model: Comment,
                        include: {model: User, attributes: ['id', 'username', 'photo_url']},
                    }
                ],
                order: [
                    [ UserProject, 'newComment', 'DESC'],
                    [ 'name' , 'ASC'],
                    [ Comment, 'createdAt', 'ASC']
                ]
            })
                .then(function(projects) {          //counting the new comments
                    var commentCount = 0;
                    UserTask.count({
                        where: {
                            UserId: req.user.id,
                            newComment: true
                        }
                    }).then( function(count){
                        commentCount = count;
                        UserProject.count({
                            where: {
                                UserId: req.user.id,
                                newComment: true
                            }
                        }).then( function(count){
                            commentCount += count;
                            res.json({                      //response with status 200
                                success: true,
                                taskComments: tasks,
                                projectComments: projects,
                                commentCount: commentCount
                            });
                        });
                    });

                });
        })
};

exports.getTasksAndProjects = function(req,res){
    Task.findAll({                  //first get the tasks of the user
        include:{
            model: UserTask,
            attributes: [],
            where: {
                UserId: req.user.id,
                $and: [
                    {shareStatus: {$ne: "pending"}},
                    {shareStatus: {$ne: "declined"}},
                    {shareStatus: {$ne: "deleted"}}
                ]
            }
        }
    })
        .then(function(tasks){                      // then get the projects
            Project.findAll({                  //first get the tasks of the user
                include:{
                    model: UserProject,
                    attributes: [],
                    where: {
                        UserId: req.user.id,
                        $and: [
                            {shareStatus: {$ne: "pending"}},
                            {shareStatus: {$ne: "declined"}},
                            {shareStatus: {$ne: "deleted"}}
                        ]
                    }
                }
            })
                .then(function(projects) {
                    res.json({                      //response with status 200
                        success: true,
                        tasks: tasks,
                        projects: projects
                    });
                })
        })

};

exports.clearNewComment = function(req,res) {
    if (req.body.task) {
        UserTask.findOne({
            where: {
                UserId: req.user.id,
                TaskId: req.body.task.id
            }
        }).then(function (userTask) {
            userTask.updateAttributes({newComment: false});

            Task.findOne({
                attributes: ['id', 'name'],
                where: {id: req.body.task.id},
                include: [
                    {
                        model: UserTask,
                        attributes: ['newComment'],
                        where: {
                            UserId: req.user.id,
                            $and: [
                                {shareStatus: {$ne: "pending"}},
                                {shareStatus: {$ne: "declined"}},
                                {shareStatus: {$ne: "deleted"}}
                            ]
                        }
                    },
                    {
                        model: Comment,
                        include: {model: User, attributes: ['id', 'username', 'photo_url']}
                    }
                ],
                order: [
                    [ Comment, 'createdAt', 'ASC']
                ]
            }).then(function (task) {
                res.json({                      //response with status 200
                    success: true,
                    taskComment: task
                });
            });
        })
    }
    else {
        UserProject.findOne({
            where: {
                UserId: req.user.id,
                ProjectId: req.body.project.id
            }
        }).then(function (userProject) {
            userProject.updateAttributes({newComment: false});

            Project.findOne({
                attributes: ['id', 'name'],
                where: {id: req.body.project.id},
                include: [
                    {
                        model: UserProject,
                        attributes: ['newComment'],
                        where: {
                            UserId: req.user.id,
                            $and: [
                                {shareStatus: {$ne: "pending"}},
                                {shareStatus: {$ne: "declined"}},
                                {shareStatus: {$ne: "deleted"}}
                            ]
                        }
                    },
                    {
                        model: Comment,
                        include: {model: User, attributes: ['id', 'username', 'photo_url']}
                    }
                ],
                order: [
                    [ Comment, 'createdAt', 'ASC']
                ]
            }).then(function (project) {
                res.json({                      //response with status 200
                    success: true,
                    projectComment: project
                });
            });
        })
    }
};
