var express = require('express');
var router = express.Router();
var tasks = require('../controller/tasks.js');

router.get('/', tasks.getList);

router.post('/', tasks.create);

module.exports = router;