var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('maze', { title: 'Express 3D Maze' });
});

module.exports = router;
