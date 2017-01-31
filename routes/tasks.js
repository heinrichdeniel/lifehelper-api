var express = require('express');
var router = express.Router();
var tasks = require('../controller/tasks.js');

router.post('/', tasks.create);

module.exports = router;