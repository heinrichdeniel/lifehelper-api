var Task   = require('../database').Task;
var User   = require('../database').User;
var Project   = require('../database').Project;

var assignTaskToUser = require('../utils/assignTaskToUser');

//creating a new task
exports.create = function(req,res){
    var projectId = req.body.ProjectId!="0" ? req.body.ProjectId : null;

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
                task.updateAttributes({             //updating attributes
                    name: req.body.name,
                    description: req.body.description,
                    date: req.body.date,
                    time: req.body.time,
                    location: req.body.location,
                    lat: req.body.lat,
                    lng: req.body.lng,
                    ProjectId: projectId,
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
            ProjectId: projectId

        })
            .then(function(task) {
                assignTaskToUser(task, req.user.id);

                Task.findOne({                      //get task by id
                    where: {id: task.id},
                    include: [
                        {model: Project}
                    ]
                }).then(function(task) {
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

//get the list of tasks
exports.getList = function(req,res){
    Task.findAndCountAll({
        include:[
            {model: User, attributes: [],where:{
                id: req.user.id
            }},
            {model: Project}
        ] ,
        order: [
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
    Task.findOne({
        where: {id: req.body.id},
        include: {model: User, attributes: [],where:{
            id: req.user.id
        }}
    })
        .then(function(task) {
            task.updateAttributes({             //updating attributes
                deleted:true
            });
            res.json({                      //response with status 200
                success: true
            });
        })
};

