var User   = require('../database').User;
var express = require('express');

var generateToken = require('../utils/generateToken');       //this function return value will be the token returned to the client

exports.login = function(req,res){
    if (!req.body.email || !req.body.password){
        res.status(400).json({success: false, message: "Email address or/and password missing!"});
        return;
    }
    User.findOne({where:{email : req.body.email}}).then(function(user){
        if (!user || (user.dataValues.password != req.body.password)){                 //if the username or password is invalid
            res.json({ success: false, message: 'Wrong email address or password!'});
        }
        else {               //in case of successfully login
            var token = generateToken(user.dataValues.id, user.dataValues.email);

            res.json({                      //response with status 200
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
    })
}

exports.loginFacebook = function(req,res){
    if (!req.body.facebook_id) {
        res.status(400).json({success: false, message: 'Facebook_id missing in the body of the request'});
        return;
    }
    User.findOne({where:{$or: [{facebook_id : req.body.facebook_id}, {email : req.body.email}]}}).then(function(user){
        if (!user ){                 //if the user not exists in the database
            User.create({ facebook_id:  req.body.facebook_id, username: req.body.name, email: req.body.email, photo_url: req.body.photo_url })
                .then(function(user2) {
                    var token = generateToken(user2.dataValues.id, user2.dataValues.email);
                    res.json({                      //response with status 200
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                });
            }
        else {
            if (!user.dataValues.facebook_id){  //if the user not logged in with fb until now
                user.updateAttributes({
                    facebook_id: req.body.facebook_id
                });
            }
            var token = generateToken(user.dataValues.id, user.dataValues.email);

            res.json({                      //response with status 200
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
    })
}