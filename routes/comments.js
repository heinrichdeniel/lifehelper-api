var express = require('express');
var router = express.Router();
var comments = require('../controller/comments.js');
var checkToken = require('../middlewares/checkToken');

router.get('/', checkToken, comments.getList);

router.get('/getTasksAndProjects', checkToken, comments.getTasksAndProjects);

router.post('/', checkToken, comments.createOrUpdate);

router.post('/clearNewComment', checkToken, comments.clearNewComment);

module.exports = router;