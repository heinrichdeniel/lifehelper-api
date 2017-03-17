var express = require('express');
var router = express.Router();
var user = require('../controller/user.js');
var checkToken = require('../middlewares/checkToken');

router.post('/login/google', user.loginGoogle);

router.post('/login/facebook', user.loginFacebook);

router.post('/login', user.login);

router.post('/registration', user.registration);

router.post('/updateGeneralSettings', checkToken, user.updateGeneralSettings);

router.get('/profile', checkToken, user.getProfile);


module.exports = router;