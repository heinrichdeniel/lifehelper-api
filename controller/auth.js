var User   = require('../database').User;
var config = require('../config');
var jwt    = require('jwt-simple'); // used to create, sign, and verify tokens
var express = require('express');


exports.login = function(req,res){
    User.findOne({where:{username : req.body.username}}).then(function(user){
        if (!user || (user.dataValues.password != req.body.password)){                 //if the username or password is invalid
            res.json({ success: false, message: 'Wrong username or password!'});
        }
        else {               //in case of successfully login
            var token = jwt.encode({                    //creating the jwt.token
                data: {
                    id: user.dataValues.id,
                    username: user.dataValues.username
                },
                exp: 60*60*3 // expires in 3 hours
            },config.jwt.secret);

            res.json({                      //response with status 200
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
    })
}
