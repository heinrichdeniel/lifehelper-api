var Task   = require('../database').Task;
var User   = require('../database').User;

//creating a new task
exports.create = function(req,res){
    Task.create({name: req.body.name, description: req.body.description, date: req.body.date, time: req.body.time})
        .then(function(task) {
            User.findOne({where: {id: req.body.userID}}).then(function (user) {
                user.addTasks(task).then(function() {
                    res.json({                      //response with status 200
                        success: true,
                        message: 'Task added to database!'
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