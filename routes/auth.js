var express = require('express');
var router = express.Router();
var auth = require('../controller/auth.js');

router.post('/login/google', auth.loginGoogle);

router.post('/login/facebook', auth.loginFacebook);

router.post('/login', auth.login);

router.post('/registration', auth.registration);


module.exports = router;