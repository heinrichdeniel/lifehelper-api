var express = require('express');
var router = express.Router();
var projects = require('../controller/projects.js');
var checkToken = require('../middlewares/checkToken');

router.get('/', checkToken, projects.getList);

router.post('/', checkToken, projects.create);

module.exports = router;