var Project   = require('../database').Project;
var User   = require('../database').User;
var Task   = require('../database').Task;

var assignProjectToUser = require('../utils/assignProjectToUser');


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
                project.updateAttributes({             //updating attributes
                    name: req.body.name
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
                    name: req.body.name
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
        include: {model: User, attributes: [],where:{
            id: req.user.id
        }},
        order: [
            ['name', 'ASC']
        ],
        where:{
            deleted:{$ne: true}
        }
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
    Project.destroy({                                               //delete the project
        where: {id: req.body.id }
    })
        .then(function() {
            res.json({                      //response with status 200
                success: true,
                projectId: req.body.id
            });
        })
};
