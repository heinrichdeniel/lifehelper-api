var Task   = require('../database').Task;
var User   = require('../database').User;

//creating a new task
exports.create = function(req,res){
    if (req.body.id){           //if the task already exists
        Task.findOne({                      //get task by id
            where: {id: req.body.id},
            include: {model: User, attributes: [],where:{
                id: req.user.id
            }}
        })
            .then(function(task) {
                task.updateAttributes({             //updating attributes
                    name: req.body.name,
                    description: req.body.description,
                    date: req.body.date,
                    time: req.body.time
                });
                res.json({                      //response with status 200
                        success: true
                    });

            })
    }
    else {          //creating the new task if it not exists
        Task.create({name: req.body.name, description: req.body.description, date: req.body.date, time: req.body.time})
            .then(function(task) {
                User.findOne({where: {id: req.user.id}}).then(function (user) {
                    user.addTasks(task).then(function() {
                        res.json({                      //response with status 200
                            success: true,
                            message: 'Task added to database!',
                            task: task
                        });
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

};

//get the list of tasks
exports.getList = function(req,res){
    Task.findAndCountAll({
        include: {model: User, attributes: [],where:{
            id: req.user.id
        }},
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
        include: {model: User, attributes: [],where:{
            id: req.user.id
        }}
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