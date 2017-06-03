var express = require('express');
var router = express.Router();
var tasks = require('../controller/tasks.js');
var checkToken = require('../middlewares/checkToken');

router.get('/archive', checkToken, tasks.getArchive);

router.get('/:id', checkToken, tasks.getTask);

router.get('/', checkToken, tasks.getList);

router.post('/share', checkToken, tasks.shareTask);

router.post('/acceptShare', checkToken, tasks.acceptShare);

router.post('/declineShare', checkToken, tasks.declineShare);

router.post('/removeShare', checkToken, tasks.removeShare);

router.post('/changeOrder', checkToken, tasks.changeOrder);

router.post('/delete/:id', checkToken, tasks.delete);

router.post('/', checkToken, tasks.create);

module.exports = router;