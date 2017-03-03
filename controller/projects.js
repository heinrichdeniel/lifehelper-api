var Project   = require('../database').Project;
var User   = require('../database').User;


//create or update a task
exports.create = function(req,res){
    if (req.body.id){           //if the task already exists
        Project.findOne({                      //get task by id
            where: {id: req.body.id},
            include: {model: User, attributes: [],where:{
                id: req.user.id
            }}
        })
            .then(function(task) {
                project.updateAttributes({             //updating attributes
                    name: req.body.name
                });
                res.json({                      //response with status 200
                    success: true,
                    message: 'Project updated!',
                    task: task
                });

            })
    }
    else {          //creating the new task if it not exists
        Project.create({
            name: req.body.name
        })
            .then(function(task) {
               // assignTaskToUser(task, req.user.id);
                res.json({                      //response with status 200
                    success: true,
                    message: 'Project added to database!',
                    task: task
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

//get the list of projects
exports.getList = function(req,res){
    Project.findAndCountAll({
        include: {model: User, attributes: [],where:{
            id: req.user.id
        }},
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
