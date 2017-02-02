var Task   = require('../database').Task;
var User   = require('../database').User;

//creating a new task
exports.create = function(req,res){
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
};

//get the list of tasks
exports.getList = function(req,res){
    Task.findAndCountAll({
        attributes: ['id', 'name', 'description', 'date', 'time'],
        include: {model: User, attributes: [],where:{
            id: req.user.id
        }},
        order: 'date ASC',
        order: 'time ASC'
    })
        .then(function(tasks) {
            res.json({                      //response with status 200
                success: true,
                tasks: tasks.rows
            });
        })
};