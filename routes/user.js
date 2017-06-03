var express = require('express');
var router = express.Router();
var user = require('../controller/user.js');
var checkToken = require('../middlewares/checkToken');

router.post('/login/google', user.loginGoogle);

router.post('/login/facebook', user.loginFacebook);

router.post('/login', user.login);

router.post('/registration', user.registration);

router.post('/updateGeneralSettings', checkToken, user.updateGeneralSettings);

router.post('/updateAccountSettings', checkToken, user.updateAccountSettings);

router.get('/profile', checkToken, user.getProfile);

router.get('/list', checkToken, user.getListByFilter);

router.get('/collaborators', checkToken, user.getCollaborators);

router.get('/notifications', checkToken, user.getNotifications);

module.exports = router;