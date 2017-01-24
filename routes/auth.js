var express = require('express');
var router = express.Router();
var auth = require('../controller/auth.js');

router.post('/login', auth.login);

module.exports = router;