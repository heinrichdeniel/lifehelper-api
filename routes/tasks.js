var express = require('express');
var router = express.Router();
var tasks = require('../controller/tasks.js');
var checkToken = require('../middlewares/checkToken');

router.get('/:id', checkToken, tasks.getTask);

router.get('/', checkToken, tasks.getList);

router.post('/delete/:id', checkToken, tasks.delete);

router.post('/', checkToken, tasks.create);

module.exports = router;